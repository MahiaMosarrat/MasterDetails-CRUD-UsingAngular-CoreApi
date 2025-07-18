import { Routes } from '@angular/router';
import { ManagerList } from './components/manager-list/manager-list';
import { ManagerDetails } from './components/manager-details/manager-details';
import { ManagerForm } from './components/manager-form/manager-form';
import { Home } from './components/home/home';

export const routes: Routes = [
    {path:'',component:Home,pathMatch:'full'},
    {path:'managers',component:ManagerList},
    {path:'details/:id',component:ManagerDetails},
    {path:'create',component:ManagerForm},
     {path:'edit/:id',component:ManagerForm},
    {path:'**',redirectTo:''},
];
