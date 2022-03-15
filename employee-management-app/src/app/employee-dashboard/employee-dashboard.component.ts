import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormControl,
  FormsModule,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ApiService } from '../shared/api.service';
import { EmployeeModel } from './employee-dashboard.model';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css'],
})
export class EmployeeDashboardComponent implements OnInit {
  // This is the employee model object, we will use for posting data
  employeeModelObj: EmployeeModel = new EmployeeModel();
  // This will hold the employee response data from the get request
  // Note: the get request sends back the json of all records so we will loop through these to dynamically render them inside the table
  employeeData: any;
  // This is the name of the form group
  addEditForm: FormGroup;
  // This is the modal reference for the modal service component
  modalRef?: BsModalRef;
  // This it the modal title that we can change dynamically
  modalTitle = 'Employee Details';
  // This is the save or update button name
  saveOrUpdate = 'Save';
  // This is the closing button name
  closeBtnName = 'Cancel';

  //These booleans will allow us to choose which button to show
  showAdd!: boolean;
  showUpdate!: boolean;

  // This will inject the modalService and initialize the form using formBuilder
  constructor(
    private modalService: BsModalService,
    private fb: FormBuilder,
    private api: ApiService
  ) {
    this.addEditForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      mobile: ['', Validators.required],
      salary: ['', Validators.required],
    });
  }

  // This method will get the employees from the db
  getAllEmployees() {
    this.api.getEmployee().subscribe((response) => {
      // This will provide us with all data
      this.employeeData = response;
    });
  }

  // This method will trigger opening the modal for adding an employee
  addEmployee(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
    this.saveOrUpdate = 'Save';
    this.closeBtnName = 'Cancel';
    // Reset the form before adding
    this.addEditForm.reset();
    this.showAdd = true;
    this.showUpdate = false;
  }

  // This method is for posting a new employee
  // this will be executed when the user clicks save on the form
  postEmployeeDetails() {
    this.employeeModelObj.firstName = this.addEditForm.value.firstName;
    this.employeeModelObj.lastName = this.addEditForm.value.lastName;
    this.employeeModelObj.email = this.addEditForm.value.email;
    this.employeeModelObj.mobile = this.addEditForm.value.mobile;
    this.employeeModelObj.salary = this.addEditForm.value.salary;

    this.api.postEmployee(this.employeeModelObj).subscribe(
      (response) => {
        console.log(response);
        alert('Employee Added Successfully');
        // Reset the form after adding
        this.addEditForm.reset();
        // Once we add the employee it should be displayed, so we need to call the get request to load the new data
        this.getAllEmployees();
        // Hide the modal after successfully adding
        this.modalRef?.hide();
      },
      (err) => {
        alert('Something went wrong :(');
        // Reset the form after
        this.addEditForm.reset();
      }
    );
  }

  // This method will trigger when deleting employee
  // We are passing in the employee object from the get request we made
  // This is done from the ngFor we used to dynamically get each employee
  deleteEmployee(employee: any) {
    this.api.deleteEmployee(employee.id).subscribe((response) => {
      alert('Employee Deleted');
      // Update the table view
      this.getAllEmployees();
    });
  }

  // This method will trigger opening the modal for updating an employee
  updateEmployee(template: TemplateRef<any>, employee: any) {
    this.modalRef = this.modalService.show(template);
    this.saveOrUpdate = 'Update';
    this.closeBtnName = 'Cancel';

    this.showAdd = false;
    this.showUpdate = true;

    // Once we click on the update it should store the id value we need
    this.employeeModelObj.id = employee.id;

    // We need to populate the modal form with the current information
    this.addEditForm.controls['firstName'].setValue(employee.firstName);
    this.addEditForm.controls['lastName'].setValue(employee.lastName);
    this.addEditForm.controls['email'].setValue(employee.email);
    this.addEditForm.controls['mobile'].setValue(employee.mobile);
    this.addEditForm.controls['salary'].setValue(employee.salary);
  }

  // This method will trigger opening the modal for updating an employee from
  putEmployeeDetails() {
    // We need to sync the input from the form to the employeeModelObj we will update the information in the db with
    this.employeeModelObj.firstName = this.addEditForm.value.firstName;
    this.employeeModelObj.lastName = this.addEditForm.value.lastName;
    this.employeeModelObj.email = this.addEditForm.value.email;
    this.employeeModelObj.mobile = this.addEditForm.value.mobile;
    this.employeeModelObj.salary = this.addEditForm.value.salary;

    this.api
      .updateEmployee(this.employeeModelObj, this.employeeModelObj.id)
      .subscribe((response) => {
        alert('Updated Successfully');
        // Once we update the employee it should be displayed, so we need to call the get request to load the new data
        this.getAllEmployees();
        // Reset the form after adding
        this.addEditForm.reset();
        // Hide the modal after successfully updating
        this.modalRef?.hide();
      });
  }

  ngOnInit(): void {
    // Once the application runs this should get all the employees to render in the table
    this.getAllEmployees();
  }
}
