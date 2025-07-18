import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Manager } from '../models/manager';
import { Trainer } from '../models/trainer';
import { ManagerCreateUpdate } from '../models/manager-create-update';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
 private apiUrl = 'http://localhost:5055/api/Managers'; 
 private trainersApiUrl = 'http://localhost:5055/api/Trainers';
  constructor(private http:HttpClient) { }
  
  getManagers(): Observable<Manager[]> {
    return this.http.get<Manager[]>(this.apiUrl);
  }
  getManager(id: number): Observable<Manager> {
    return this.http.get<Manager>(`${this.apiUrl}/${id}`);
  }
  getTrainers(): Observable<Trainer[]> {
      return this.http.get<Trainer[]>(this.trainersApiUrl);
  }

  private _buildFormData( manager: ManagerCreateUpdate,
    managerId?: number, dateFieldName: string = 'dob' 
  ): FormData {
    const formData = new FormData();
    if (managerId !== undefined) {
      formData.append('managerId', managerId.toString());  }
    formData.append('name',manager.name);
    formData.append(dateFieldName, manager.dob.toISOString());
    if(manager.pictureFile){
      formData.append('pictureFile',manager.pictureFile,manager.pictureFile.name)
    }
    else if (manager.imageUrl && managerId !== undefined) {
      formData.append('imageUrl', manager.imageUrl);  }
    formData.append('contactNumber',manager.contactNumber);
    formData.append('email',manager.email);
    formData.append('isActive',manager.isActive.toString());  
    formData.append('managerTrainersJson', manager.managerTrainersJson);
    return formData;  } 
    
  createManager(manager: ManagerCreateUpdate): Observable<Manager> {
    const formData = this._buildFormData(manager, undefined, 'dob');
    return this.http.post<Manager>(this.apiUrl, formData);  } 
  updateManager(id: number, manager: ManagerCreateUpdate): Observable<any> {
    const formData = this._buildFormData(manager, id, 'dob');
    return this.http.put(`${this.apiUrl}/${id}`, formData);  }
  deleteManager(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
