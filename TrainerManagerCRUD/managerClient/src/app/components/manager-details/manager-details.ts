import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Trainer } from '../../models/trainer';
import { Manager } from '../../models/manager';
import { ManagerService } from '../../services/manager-service';

@Component({
  selector: 'app-manager-details',
  imports: [RouterLink,CommonModule],
  templateUrl: './manager-details.html',
  styleUrl: './manager-details.css'
})
export class ManagerDetails implements OnInit{
manager: Manager | undefined;
  trainers: Trainer[] = []; 
  imageUrlBase = 'http://localhost:5055/images';
  constructor( private route: ActivatedRoute,
    private service: ManagerService, private router: Router) { }
  ngOnInit(): void {
   this.service.getTrainers().subscribe({
      next: (trainers) => {
        this.trainers = trainers;
        this.route.paramMap.subscribe(params => {
          const id = Number(params.get('id'));
          if (id) {this.loadManager(id);} 
          else {this.router.navigate(['/managers']);}
        });
      },
      error: (err) => {
        console.error('Error loading all trainers:', err);
        alert('Failed to load trainers data. Display might be incomplete.');
        this.route.paramMap.subscribe(params => {
          const id = Number(params.get('id'));
          if (id) {this.loadManager(id);} 
          else {
           this.router.navigate(['/managers']);
          }
        });
      }
    });
  }
  
  loadManager(id: number): void {
    this.service.getManager(id).subscribe({
      next: (manager) => {
        this.manager = manager;
       if (this.manager && this.manager.managerTrainers && this.trainers.length > 0) {
          this.manager.managerTrainers = this.manager.managerTrainers.map(cs => {
          if (cs.trainer && cs.trainer.name) {
              return cs;
            } else {
              const foundTrainer = this.trainers.find(s => s.trainerId === cs.trainerId);
              return { ...cs,
                trainer: foundTrainer 
              };
            }
          });
        }
        console.log('Loaded Manager Data:', this.manager);
      },
      error: (err) => {
        this.router.navigate(['/managers']);
      }
    });
  }
  deleteManager(id: number | undefined): void {
    if (id === undefined) {
      console.warn('manager with undefined ID.');
      return;
    }
    if (confirm('Are you sure you want to delete this manager? ')) {
      this.service.deleteManager(id).subscribe({
        next: () => {
          console.log(`deleted successfully.`);
          this.router.navigate(['/managers']);
        },
        error: (err) => {
          alert('Failed to delete manager.');
        }
      });
    }
  }
}
