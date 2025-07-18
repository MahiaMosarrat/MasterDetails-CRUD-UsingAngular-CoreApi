export interface ManagerCreateUpdate {
     managerId?:number;
    name:string;
    dob:Date;
    imageUrl?:string;
    pictureFile?:File| null;
    contactNumber:string;
    email:string;
    isActive:boolean;
    managerTrainersJson:string;
}
