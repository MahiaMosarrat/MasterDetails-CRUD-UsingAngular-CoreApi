import { ManagerTrainerAssignment } from "./manager-trainer-assignment";

export interface Manager {
    managerId:number;
    name:string;
    dob:Date;
    imageUrl:string|null;
    contactNumber:string; 
    email:string;
    isActive:boolean;
    managerTrainers:ManagerTrainerAssignment[];
}
