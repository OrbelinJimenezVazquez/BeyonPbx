from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from datetime import datetime, timedelta
from fastapi import Query

router = APIRouter(prefix="/api", tags=["Telephony"])

@router.get("/extensions")
def get_extensions(db: Session = Depends(get_db)):
    query = text("""
        SELECT 
          u.extension,
          u.name,
          CASE 
            WHEN s_host.data IS NULL THEN 'offline'
            WHEN s_host.data = 'dynamic' THEN 'online'
            WHEN s_host.data REGEXP '^[0-9]{1,3}\\\\.[0-9]{1,3}\\\\.[0-9]{1,3}\\\\.[0-9]{1,3}$' THEN 'online'
            ELSE 'offline'
          END AS status
        FROM asterisk.users u
        LEFT JOIN asterisk.sip s_host 
          ON u.extension = s_host.id AND s_host.keyword = 'host'
        ORDER BY u.extension
    """)
    result = db.execute(query).fetchall()
    return [
        {"extension": row[0], "name": row[1], "status": row[2]}
        for row in result
    ]

@router.get("/calls")
def get_calls(
    period: str = Query("month", enum=["today", "week", "month", "year"]),
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=1000),  # máximo 1000 por página
    db: Session = Depends(get_db)
):
    now = datetime.now()
    
    # Calcular fecha de inicio según el período
    if period == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "year":
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=30)  # default: último mes

    offset = (page - 1) * size

    # Contar total de registros (para paginación)
    count_query = text("""
        SELECT COUNT(*) 
        FROM asteriskcdrdb.cdr 
        WHERE calldate >= :start_date
    """)
    total = db.execute(count_query, {"start_date": start_date}).scalar()

    # Obtener registros paginados
    data_query = text("""
        SELECT 
            src, 
            dst, 
            calldate, 
            duration, 
            disposition
        FROM asteriskcdrdb.cdr
        WHERE calldate >= :start_date
        ORDER BY calldate DESC
        LIMIT :size OFFSET :offset
    """)
    
    result = db.execute(data_query, {
        "start_date": start_date,
        "size": size,
        "offset": offset
    }).fetchall()
    
    return {
        "items": [
            {
                "src": row[0],
                "dst": row[1],
                "calldate": row[2],
                "duration": row[3],
                "disposition": row[4]
            }
            for row in result
        ],
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size  # redondeo hacia arriba
    }

@router.get("/trunks")
def get_trunks(db: Session = Depends(get_db)):
    query = text("""
        SELECT 
            name,
            tech,
            channelid
        FROM asterisk.trunks
        ORDER BY name
    """)
    result = db.execute(query).fetchall()
    return [
        {
            "name": row[0],
            "tech": row[1],
            "channelid": row[2]
        }
        for row in result
    ]

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    now = datetime.now()
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Llamadas hoy
    today_calls = db.execute(text("""
        SELECT COUNT(*), AVG(duration), 
               SUM(CASE WHEN disposition = 'ANSWERED' THEN 1 ELSE 0 END)
        FROM asteriskcdrdb.cdr 
        WHERE calldate >= :start_date
    """), {"start_date": start_of_day}).fetchone()

    # Llamadas este mes
    month_calls = db.execute(text("""
        SELECT COUNT(*)
        FROM asteriskcdrdb.cdr 
        WHERE calldate >= :start_date
    """), {"start_date": start_of_month}).fetchone()

    # Extensiones activas (online)
    active_extensions = db.execute(text("""
        SELECT COUNT(*)
        FROM asterisk.users u
        LEFT JOIN asterisk.sip s_host 
          ON u.extension = s_host.id AND s_host.keyword = 'host'
        WHERE s_host.data IS NOT NULL 
          AND (s_host.data = 'dynamic' OR s_host.data REGEXP '^[0-9]{1,3}\\\\.[0-9]{1,3}\\\\.[0-9]{1,3}\\\\.[0-9]{1,3}$')
    """)).fetchone()

    total_calls_today = today_calls[0] or 0
    avg_duration = round(today_calls[1] or 0, 1)
    answered_calls = today_calls[2] or 0
    answer_rate = round((answered_calls / total_calls_today * 100), 1) if total_calls_today > 0 else 0

    return {
        "calls_today": total_calls_today,
        "calls_this_month": month_calls[0] or 0,
        "avg_duration": avg_duration,
        "answer_rate": answer_rate,
        "active_extensions": active_extensions[0] or 0
    }
