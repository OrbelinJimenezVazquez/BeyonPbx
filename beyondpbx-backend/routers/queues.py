# routers/queues.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import QueueName
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/queues", tags=["queues"])

# Schemas
class QueueBase(BaseModel):
    queue: str

class QueueCreate(QueueBase):
    pass

class QueueUpdate(QueueBase):
    pass

class QueueResponse(QueueBase):
    device: str

    class Config:
        from_attributes = True

# CRUD Endpoints
@router.get("")
def get_queues(db: Session = Depends(get_db)):
    """Obtener todas las colas"""
    try:
        queues = db.query(QueueName).order_by(QueueName.device).all()
        
        # IMPORTANTE: Devolver lista directa para que funcione con el frontend
        queues_list = [
            {
                "device": q.device,
                "queue": q.queue
            }
            for q in queues
        ]
        
        # Devolver en formato directo que ya está manejando el frontend
        return queues_list
        
    except Exception as e:
        print(f"Error en get_queues: {str(e)}")  # Para debugging
        raise HTTPException(status_code=500, detail=f"Error al obtener colas: {str(e)}")

@router.get("/{queue_id}", response_model=QueueResponse)
def get_queue(queue_id: str, db: Session = Depends(get_db)):
    """Obtener una cola por device ID"""
    queue = db.query(QueueName).filter(QueueName.device == queue_id).first()
    if not queue:
        raise HTTPException(status_code=404, detail="Cola no encontrada")
    return queue

@router.post("", status_code=201)
def create_queue(queue_data: QueueCreate, db: Session = Depends(get_db)):
    """Crear una nueva cola"""
    try:
        print(f"📥 Recibiendo solicitud para crear cola: {queue_data.queue}")
        
        # Verificar si ya existe una cola con el mismo nombre
        existing = db.query(QueueName).filter(
            QueueName.queue == queue_data.queue
        ).first()
        
        if existing:
            print(f"⚠️ Cola duplicada: {queue_data.queue}")
            raise HTTPException(
                status_code=400, 
                detail="Ya existe una cola con ese nombre"
            )
        
        # Obtener el siguiente device ID disponible
        print("🔍 Buscando último device ID...")
        max_device_query = db.query(QueueName).order_by(QueueName.device.desc()).first()
        
        if max_device_query and max_device_query.device:
            print(f"📌 Último device encontrado: {max_device_query.device}")
            try:
                # Intentar convertir a int y sumar 1
                next_device_num = int(max_device_query.device) + 1
                next_device = str(next_device_num)
                print(f"✅ Nuevo device ID: {next_device}")
            except ValueError:
                # Si no es numérico, buscar el mayor número
                print("⚠️ Device ID no numérico, buscando alternativa...")
                all_devices = db.query(QueueName.device).all()
                numeric_devices = []
                for d in all_devices:
                    try:
                        numeric_devices.append(int(d[0]))
                    except:
                        continue
                
                if numeric_devices:
                    next_device = str(max(numeric_devices) + 1)
                else:
                    next_device = "100"  # Empezar desde 100 si no hay numéricos
                print(f"✅ Nuevo device ID (alternativo): {next_device}")
        else:
            next_device = "1"
            print(f"✅ Primera cola, device ID: {next_device}")
        
        # Crear nueva cola
        print(f"💾 Creando cola en BD: device={next_device}, queue={queue_data.queue}")
        new_queue = QueueName(
            device=next_device,
            queue=queue_data.queue
        )
        
        db.add(new_queue)
        db.commit()
        db.refresh(new_queue)
        
        print(f"✅ Cola creada exitosamente: {new_queue.device} - {new_queue.queue}")
        
        # Devolver en formato simple
        return {
            "device": new_queue.device,
            "queue": new_queue.queue,
            "message": "Cola creada exitosamente"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error en create_queue: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al crear cola: {str(e)}")

@router.put("/{queue_id}", response_model=QueueResponse)
def update_queue(queue_id: str, queue_data: QueueUpdate, db: Session = Depends(get_db)):
    """Actualizar una cola existente"""
    try:
        # Buscar la cola
        queue = db.query(QueueName).filter(QueueName.device == queue_id).first()
        if not queue:
            raise HTTPException(status_code=404, detail="Cola no encontrada")
        
        # Verificar si el nuevo nombre ya existe en otra cola
        existing = db.query(QueueName).filter(
            QueueName.device != queue_id,
            QueueName.queue == queue_data.queue
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=400, 
                detail="Ya existe otra cola con ese nombre"
            )
        
        # Actualizar campos
        queue.queue = queue_data.queue
        
        db.commit()
        db.refresh(queue)
        
        return queue
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error en update_queue: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al actualizar cola: {str(e)}")

@router.delete("/{queue_id}")
def delete_queue(queue_id: str, db: Session = Depends(get_db)):
    """Eliminar una cola"""
    try:
        queue = db.query(QueueName).filter(QueueName.device == queue_id).first()
        if not queue:
            raise HTTPException(status_code=404, detail="Cola no encontrada")
        
        db.delete(queue)
        db.commit()
        
        return {"message": "Cola eliminada exitosamente", "id": queue_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error en delete_queue: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al eliminar cola: {str(e)}")