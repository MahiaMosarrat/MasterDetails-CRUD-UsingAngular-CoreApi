

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Manager } from '../../models/manager';
import { Trainer } from '../../models/trainer';
import { ManagerService } from '../../services/manager-service';

@Component({
  selector: 'app-manager-list',
  imports: [CommonModule,RouterLink],
  templateUrl: './manager-list.html',
  styleUrl: './manager-list.css'
})
export class ManagerList implements OnInit {

  managers:Manager[]=[];
   trainers: Trainer[] = [];
  imageUrlBase = 'http://localhost:5055/images/';
  constructor(private service:ManagerService,  private router: Router){}
   ngOnInit(): void {
    this.service.getTrainers().subscribe({
      next: (trainers) => {
        this.trainers = trainers;
        this.loadManagers();
      },
      error: (err) => {
       alert('Failed to load skill data.');
        this.loadManagers();
      }
    });
  }
  loadManagers(): void {
    this.service.getManagers().subscribe({
      next: (data) => {
        this.managers = data.map(manager => ({
          ...manager,
         imageUrl: manager.imageUrl && manager.imageUrl !== 'noimage.png' ? manager.imageUrl : 'noimage.png'
        }));
      },
      error: (err) => {
        console.error('Failed to load managers:', err); 
        alert('Failed to load managers.');
      }
    });
  }


deleteManager(id: number): void {
    if (confirm('Are you sure you want to delete this manager?')) {
      this.service.deleteManager(id).subscribe({
        next: () => { console.log(`Deleted successfully.`);
          this.managers = this.managers.filter(c => c.managerId !== id);
        },
        error: (err) => { alert('Failed to delete.');}
      });
    }
  }
  
}