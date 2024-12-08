import { Component } from '@angular/core';
import { GoogleButtonComponent } from '../../shared/components/google-button.component';

@Component({
    selector: 'f-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [GoogleButtonComponent]
})
export class LoginComponent {}
