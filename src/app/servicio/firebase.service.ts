import { Injectable } from '@angular/core';
import { Database, ref, get, set } from '@angular/fire/database';
import { Usuario, Asignatura, Asistencia } from '../modelos/modelos';
import { Storage } from '@ionic/storage-angular';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  user: Usuario = new Usuario()
  private currentUser: Usuario = new Usuario();

  constructor(private db: Database,private storage: Storage) { 
    this.storage.create();
  }

  async setCurrentUser(usuario: Usuario) {
    this.currentUser = usuario;
    await this.storage.set('currentUser', usuario);
  }

  async getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }
    this.currentUser = await this.storage.get('currentUser');
    return this.currentUser;
  }

  async clearCurrentUser() {
    this.currentUser = new Usuario();
    this.storage.remove('currentUser');
  }

  async obtenerUsuario(user: string) {
    const userRef = ref(this.db, `/usuario/${user}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      this.user = snapshot.val();
      return this.user
    } else {
      return null;
    }
  }

  async validarUsuario(user: string, password: string) {
    const usuario = await this.obtenerUsuario(user);
    if (usuario && usuario.contrasena === password) {
      return true; // Usuario y contraseña correctos
    }
    return false; // Usuario no encontrado o contraseña incorrecta
  }

  async obtenerAsignatura(nombreAsignatura: string): Promise<Asignatura | null> {
    const asignaturaRef = ref(this.db, `/asignatura/${nombreAsignatura}`);
    const snapshot = await get(asignaturaRef);
    if (snapshot.exists()) {
      return snapshot.val() as Asignatura; // Retorna los datos de la asignatura
    } else {
      return null; // No se encontró la asignatura
    }
  }
  
  generateUuid(): string {
    return uuidv4();
  }

  getCurrentTimestamp(): number {
    return new Date().getTime();
  }

  async crearAsistencia(asignatura: Asignatura): Promise<string> {
    const uuid = this.generateUuid();

    // Crear un nuevo objeto Asistencia usando la clase modelo
    const nuevaAsistencia = new Asistencia();
    nuevaAsistencia.fecha = this.getCurrentTimestamp();
    nuevaAsistencia.nombre_asignatura = asignatura.nombre;
    nuevaAsistencia.codigo_asignatura = asignatura.codigo;
    nuevaAsistencia.id_asistencia = uuid;

    // Guardar el objeto Asistencia en Firebase
    const asistenciaRef = ref(this.db, `/asistencia/${uuid}`);
    await set(asistenciaRef, nuevaAsistencia);

    return uuid; // Devuelve el UUID del nuevo registro de asistencia
  }

  async alumnoPresente(idAsistencia: string, idUsuario: string): Promise<void> {
    const attendanceRef = ref(this.db, `asistencia/${idAsistencia}`);
    console.log("SERVICIO "+attendanceRef)
    try {
      const snapshot = await get(attendanceRef);
      if (snapshot.exists()) {
        const attendance = snapshot.val();
        attendance.alumnos_presentes = attendance.alumnos_presentes || [];
        if (!attendance.alumnos_presentes.includes(idUsuario)) {
          attendance.alumnos_presentes.push(idUsuario);
          await set(attendanceRef, attendance);
        }
      } else {
        console.log('Attendance record not found');
      }
    } catch (error) {
      console.error('Error updating attendance record:', error);
      throw error;
    }
  }
}

