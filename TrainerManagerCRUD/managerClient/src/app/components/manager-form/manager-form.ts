import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Trainer } from '../../models/trainer';
import { ManagerService } from '../../services/manager-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Manager } from '../../models/manager';
import { ManagerCreateUpdate } from '../../models/manager-create-update';
import { ManagerTrainerAssignment } from '../../models/manager-trainer-assignment';

@Component({
  selector: 'app-manager-form',
  imports: [CommonModule,FormsModule,ReactiveFormsModule,RouterLink],
  templateUrl: './manager-form.html',
  styleUrl: './manager-form.css'
})
export class ManagerForm implements OnInit {
 managerForm!: FormGroup;
  isEditMode = false;
  managerId: number | null = null;
  trainers: Trainer[] = [];
  selectedFile: File | null = null;
  currentPicture: string | null = null; 
  imageUrlBase = 'http://localhost:5055/images/';
  imagePreviewUrl: string | ArrayBuffer | null = null; 

  constructor(
    private fb: FormBuilder,
    private service: ManagerService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadTrainers();
    this.initForm(); 

    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.managerId = +id; 
        this.loadManager(this.managerId); 
      }
    });
  }

 
  initForm(): void {
    this.managerForm = this.fb.group({
      name: ['', Validators.required],
      dob: ['', Validators.required],
      pictureFile: [null], 
      contactNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      isActive: [true], 
      managerTrainerAssignments: this.fb.array([])
    });
  }


  loadTrainers(): void {
    this.service.getTrainers().subscribe({
      next: (data: Trainer[]) => {
        this.trainers = data;
      },
      error: (err) => {
        console.error('Error loading trainers:', err);
        alert('Could not load trainers. Please try again later.');
      }
    });
  }

 
  loadManager(id: number): void {
    this.service.getManager(id).subscribe({
      next: (manager: Manager) => {
        
        this.managerForm.patchValue({
          name: manager.name,
          
          dob: manager.dob ? new Date(manager.dob).toISOString().split('T')[0] : '',
          contactNumber: manager.contactNumber,
          email: manager.email,
          isActive: manager.isActive
        });

      
        this.currentPicture = manager.imageUrl ?? null;
        if (this.currentPicture) {
        
          this.imagePreviewUrl = this.imageUrlBase + this.currentPicture;
        } else {
          this.imagePreviewUrl = null;
        }

        
       
        manager.managerTrainers.forEach(cs => {
         
          const formattedJoiningDate = cs.joiningDate ? new Date(cs.joiningDate).toISOString().split('T')[0] : '';
          this.addManagerTrainerAssignment(cs.trainerId, formattedJoiningDate);
        });
      },
      error: (err) => {
        console.error('Error loading manager for edit:', err);
        alert('Failed to load manager details. Redirecting to list.');
        this.router.navigate(['/managers']);
      }
    });
  }

  
  get managerTrainerAssignments(): FormArray {
    return this.managerForm.get('managerTrainerAssignments') as FormArray;
  }

  
  newManagerTrainerAssignment(trainerId: number = 0, joiningDate: string = ''): FormGroup {
    
    return this.fb.group({
      trainerId: [trainerId, Validators.min(1)], 
      joiningDate: [joiningDate, Validators.required] 
    });
  }

 
  addManagerTrainerAssignment(trainerId?: number, joiningDate?: string): void {
  
    this.managerTrainerAssignments.push(this.newManagerTrainerAssignment(trainerId || 0, joiningDate || ''));
  }


  removeManagerTrainerAssignment(index: number): void {
    this.managerTrainerAssignments.removeAt(index);
  }

 
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result; 
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.imagePreviewUrl = null;
    }
  }

 
  onSubmit(): void {
  
    this.managerForm.markAllAsTouched();
    this.markFormArrayControlsAsTouched(this.managerTrainerAssignments);

    if (this.managerForm.invalid) {
      alert('Please correct the validation errors before submitting.');
      return;
    }

    const formValues = this.managerForm.value;

   
    let dob: Date;
    if (formValues.dob) {
      dob = new Date(formValues.dob);
      if (isNaN(dob.getTime())) {
        alert('The Date of Birth you entered is not valid.');
        return;
      }
    } else {
      
      alert('Date of Birth is required.');
      return;
    }

    
    const managerTrainerAssignmentData: ManagerTrainerAssignment[] = formValues.managerTrainerAssignments.map((cs: any) => ({
      trainerId: Number(cs.trainerId), 
      joiningDate: cs.joiningDate 
    }));

   
    const managerData: ManagerCreateUpdate = {
      name: formValues.name,
      dob: dob, 
      pictureFile: this.selectedFile, // The actual File object
      contactNumber: formValues.contactNumber,
      email: formValues.email,
      isActive: formValues.isActive,
    
      managerTrainersJson: JSON.stringify(managerTrainerAssignmentData)
    };

    if (this.isEditMode && this.managerId !== null) {
     
      if (!this.selectedFile && this.currentPicture) {
        managerData.imageUrl = this.currentPicture;
      }
      this.service.updateManager(this.managerId, managerData).subscribe({
        next: () => {
          alert('Manager updated successfully!');
          this.router.navigate(['/managers']);
        },
        error: (err) => {
          console.error('Update error:', err);
          alert('Failed to update manager. Details: ' + (err.error?.title || err.message || 'Unknown error'));
        }
      });
    } else {
      this.service.createManager(managerData).subscribe({
        next: () => {
          alert('Manager created successfully!');
          this.router.navigate(['/managers']);
        },
        error: (err) => {
          console.error('Create error:', err);
          alert('Failed to create manager. Details: ' + (err.error?.title || err.message || 'Unknown error'));
        }
      });
    }
  }

 
  private markFormArrayControlsAsTouched(formArray: FormArray): void {
    formArray.controls.forEach((control: AbstractControl) => {
      if (control instanceof FormGroup) {
        Object.values(control.controls).forEach((innerControl: AbstractControl) => innerControl.markAsTouched());
      } else {
        control.markAsTouched();
      }
    });
  }

 
  isControlInvalid(controlName: string): boolean {
    const control = this.managerForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getAssignmentControl(index: number, controlName: string): AbstractControl | null {
    const group = this.managerTrainerAssignments.at(index);
    return group.get(controlName);
  }

  isAssignmentControlInvalid(index: number, controlName: string): boolean {
    const control = this.getAssignmentControl(index, controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}