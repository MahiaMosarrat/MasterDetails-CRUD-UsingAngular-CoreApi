import { Trainer } from "./trainer";

export interface ManagerTrainerAssignment {
     managerId?:number;
    trainerId:number;
      name:string;
    trainer?:Trainer;
    joiningDate?:string
}
