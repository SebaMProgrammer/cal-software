import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from 'src/app/servicio/firebase.service';
import { Asignatura } from 'src/app/modelos/modelos';

@Component({
  selector: 'app-informacion-asignatura',
  templateUrl: './informacion-asignatura.page.html',
  styleUrls: ['./informacion-asignatura.page.scss'],
})
export class InformacionAsignaturaPage implements OnInit {

  asignatura : Asignatura = new Asignatura()
  codigoAsignatura: string = '';

  constructor(private activatedroute: ActivatedRoute, private fire:FirebaseService, private router : Router) { }

  ngOnInit() {
    this.activatedroute.queryParams.subscribe(async params => {
      if (params['codigo']) {
        this.codigoAsignatura = params['codigo'];
        const asignaturaObtenida = await this.fire.obtenerAsignatura(this.codigoAsignatura);
        if (asignaturaObtenida) {
          this.asignatura = asignaturaObtenida;
        } else {
          // Manejar el caso de que la asignatura no se encuentre
          console.log('Asignatura no encontrada');
        }
      }
    });
  }

  async crearAsistencia(){
    const uuid = await this.fire.crearAsistencia(this.asignatura)
    this.verDetalleAsignatura(uuid)

  }

  verDetalleAsignatura(id_asistencia: string) {
    this.router.navigate(['/qr'], {
      queryParams: { id_asistencia: id_asistencia }
    });
  }

}
