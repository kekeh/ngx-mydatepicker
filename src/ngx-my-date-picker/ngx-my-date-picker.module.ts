import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ModuleWithProviders, NgModule } from "@angular/core";
import { NgxMyDatePicker } from "./ngx-my-date-picker.component";
import { NgxMyDatePickerDirective } from "./ngx-my-date-picker.input";
import { FocusDirective } from "./directives/ngx-my-date-picker.focus.directive";
import { NgxMyDatePickerConfig } from "./services/ngx-my-date-picker.config";

@NgModule({
    imports: [CommonModule, FormsModule],
    declarations: [NgxMyDatePicker, NgxMyDatePickerDirective, FocusDirective],
    entryComponents: [NgxMyDatePicker],
    exports: [NgxMyDatePicker, NgxMyDatePickerDirective, FocusDirective]
})
export class NgxMyDatePickerModule {
    static forRoot(): ModuleWithProviders<NgxMyDatePickerModule> {
        return {
            ngModule: NgxMyDatePickerModule,
            providers: [NgxMyDatePickerConfig]
        };
    }
}