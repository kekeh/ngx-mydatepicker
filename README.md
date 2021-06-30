# ngx-mydatepicker

__If your Angular version is >= 7.2 you can use a new version ([angular-mydatepicker](https://github.com/kekeh/angular-mydatepicker)) of this component:__ 
* [repository](https://github.com/kekeh/angular-mydatepicker) 
* [online demo](https://kekeh.github.io/angular-mydatepicker/) 

**Version compatibility of this library**

| Library version | Angular version | Branch | Installation |
| :-------------- | :-------------- | :----- | :----------- |
| < 9.0.0 | >= 2 and < 9 | master | npm install --save ngx-mydatepicker@latest| 
| >= 9.0.0 | >= 9 | angularIvy | npm install --save ngx-mydatepicker@ng9 | 

**Angular date picker**

[![Build Status](https://travis-ci.org/kekeh/ngx-mydatepicker.svg?branch=master)](https://travis-ci.org/kekeh/ngx-mydatepicker)
[![codecov](https://codecov.io/gh/kekeh/ngx-mydatepicker/branch/master/graph/badge.svg)](https://codecov.io/gh/kekeh/ngx-mydatepicker)
[![npm](https://img.shields.io/npm/v/ngx-mydatepicker.svg?maxAge=2592000?style=flat-square)](https://www.npmjs.com/package/ngx-mydatepicker)
[![npm](https://img.shields.io/npm/dt/ngx-mydatepicker.svg)](https://www.npmjs.com/package/ngx-mydatepicker)

## Description
Angular attribute directive date picker. Compatible __Angular2+__.

There is similar date picker [here](https://github.com/kekeh/mydatepicker), but difference between these
two is that with the ngx-mydatepicker you can define the style of input box, calendar and clear buttons.

Online demo of bootstrap styled input box and glyphicons is [here](http://kekeh.github.io/ngx-mydatepicker)

## Installation

To install this component to an external project, follow the procedure:

1. __npm install ngx-mydatepicker --save__

2. Add __MyDatePickerModule__ import to your __@NgModule__ like example below
    ```ts
    import { NgModule } from '@angular/core';
    import { BrowserModule } from '@angular/platform-browser';
    import { MyTestApp } from './my-test-app';
    import { NgxMyDatePickerModule } from 'ngx-mydatepicker';

    @NgModule({
        imports:      [ BrowserModule, NgxMyDatePickerModule.forRoot() ],
        declarations: [ MyTestApp ],
        bootstrap:    [ MyTestApp ]
    })
    export class MyTestAppModule {}
    ```

3. If you are using __systemjs__ package loader add the following ngx-mydatepicker properties to the __System.config__:
    ```js
    (function (global) {
        System.config({
            paths: {
                'npm:': 'node_modules/'
            },
            map: {
                // Other components are here...

                'ngx-mydatepicker': 'npm:ngx-mydatepicker/bundles/ngx-mydatepicker.umd.min.js'
            },
            packages: {
            }
        });
    })(this);
    ```
    
## Usage

Use one of the following two options.

### 1. ngModel binding

In this option the ngModel binding is used. [Here](https://github.com/kekeh/ngx-mydatepicker/tree/master/examples/sample-date-picker-ngmodel)
is an example application. It shows how to use the __ngModel__.

To use ngModel define the application class as follows:

```ts
import {INgxMyDpOptions, IMyDateModel} from 'ngx-mydatepicker';
// other imports here...

export class MyTestApp {

    myOptions: INgxMyDpOptions = {
        // other options...
        dateFormat: 'dd.mm.yyyy',
    };

    // Initialized to specific date (09.10.2018)
    model: any = { date: { year: 2018, month: 10, day: 9 } };

    constructor() { }

    // optional date changed callback
    onDateChanged(event: IMyDateModel): void {
        // date selected
    }
}
```

Add the following snippet inside your template:

```html
<!-- input box styling is bootstrap 3.3.7 -->
<form>
    <div class="input-group">
        <input class="form-control" style="float:none" placeholder="Select a date" ngx-mydatepicker name="mydate"
               [(ngModel)]="model" [options]="myOptions" #dp="ngx-mydatepicker" (dateChanged)="onDateChanged($event)"/>

        <span class="input-group-btn">
            <button type="button" class="btn btn-default" (click)="dp.clearDate()">
                <i class="glyphicon glyphicon-remove"></i>
            </button>
            <button type="button" class="btn btn-default" (click)="dp.toggleCalendar()">
                <i class="glyphicon glyphicon-calendar"></i>
            </button>
        </span>
    </div>
</form>
```

There are two ways to set an initial date to the model.

  * Initialize with the __IMyDate__ object:
  ```ts
  // Initialized to specific date (09.10.2018)
  model: any = { date: { year: 2018, month: 10, day: 9 } };
  ```

  * Initialize with the __JS date__ object:
  ```ts
  // Initialized to today
  model: any = { jsdate: new Date() };
  ```

### 2. Reactive forms

In this option the value accessor of reactive forms is used. [Here](https://github.com/kekeh/ngx-mydatepicker/tree/master/examples/sample-date-picker-reactive-forms)
is an example application. It shows how to use the __formControlName__.

To use reactive forms define the application class as follows:

```ts
import {INgxMyDpOptions} from 'ngx-mydatepicker';
// other imports here...

export class MyTestApp implements OnInit {

    myOptions: INgxMyDpOptions = {
        // other options...
        dateFormat: 'dd.mm.yyyy',
    };

    private myForm: FormGroup;

    constructor(private formBuilder: FormBuilder) { }

    ngOnInit() {
        this.myForm = this.formBuilder.group({
            // Empty string or null means no initial value. Can be also specific date for
            // example: {date: {year: 2018, month: 10, day: 9}} which sets this date to initial
            // value.

            myDate: [null, Validators.required]
            // other controls are here...
        });
    }

    setDate(): void {
        // Set today date using the patchValue function
        let date = new Date();
        this.myForm.patchValue({myDate: {
        date: {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()}
        }});
    }

    clearDate(): void {
        // Clear the date using the patchValue function
        this.myForm.patchValue({myDate: null});
    }
}
```

Add the following snippet inside your template:

```html
<!-- input box styling is bootstrap 3.3.7 -->
<form [formGroup]="myForm" (ngSubmit)="onSubmit()" novalidate>
    <div class="input-group">
        <input class="form-control" style="float:none" placeholder="Select a date" ngx-mydatepicker name="myDate"
               formControlName="myDate" [options]="myOptions" #dp="ngx-mydatepicker"/>

        <span class="input-group-btn">
            <button type="button" class="btn btn-default" (click)="dp.clearDate()">
                <i class="glyphicon glyphicon-remove"></i>
            </button>
            <button type="button" class="btn btn-default" (click)="dp.toggleCalendar()">
                <i class="glyphicon glyphicon-calendar"></i>
            </button>
        </span>
    </div>

    <div class="btnGroup">
        <button class="button" type="submit" [disabled]="myForm.controls.myDate.errors">Submit</button>
        <p class="error" *ngIf="myForm.controls.myDate.errors">Date is required!</p>
    </div>
</form>
```

## Attributes

### options attribute

Value of the __options__ attribute is a type of [INgxMyDpOptions](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-options.interface.ts). It can contain the following properties.

| Option         | Default        | Type | Description |
| :------------- | :------------- | :----| :---------- |
| __dayLabels__     | {su: 'Sun', mo: 'Mon', tu: 'Tue', we: 'Wed', th: 'Thu', fr: 'Fri', sa: 'Sat'} | [IMyDayLabels](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-day-labels.interface.ts) | Day labels visible on the selector. |
| __monthLabels__   | { 1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec' } | [IMyMonthLabels](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-month-labels.interface.ts) | Month labels visible on the selector. |
| __dateFormat__    | yyyy-mm-dd | string |  Date format on the selection area and the callback. For example: d.m.yyyy, dd.mm.yyyy, yyyy-m-d, yyyy-mm-dd, d mmm yyyy, dd mmm yyyy (d = Day not leading zero, dd = Day with leading zero, m = Month not leading zero, mm = Month with leading zero, mmm = Month as a text, yyyy = Year four digit) |
| __showTodayBtn__   | true | boolean | Show 'Today' button on calendar. |
| __todayBtnTxt__   | Today | string | Today button text. Can be used if __showTodayBtn = true__. |
| __firstDayOfWeek__   | mo | string | First day of week on calendar. One of the following: mo, tu, we, th, fr, sa, su |
| __sunHighlight__   | true | boolean | Sunday red colored on calendar. |
| __satHighlight__   | false | boolean | Saturday red colored on calendar. |
| __highlightDates__   | no default value | Array<[IMyDate](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-date.interface.ts)> | Dates red colored on calendar. For example: [{year: 2016, month: 11, day: 14}, {year: 2016, month: 1, day: 15}] |
| __markCurrentDay__   | true | boolean | Is current day (today) marked on calendar. |
| __markCurrentMonth__   | true | boolean | Is current month marked on calendar. Can be used if __monthSelector = true__. |
| __markCurrentYear__   | true | boolean | Is current year marked on calendar. Can be used if __yearSelector = true__. |
| __monthSelector__  | true | boolean | If month label is selected opens a selector of months. |
| __yearSelector__  | true | boolean | If year label is selected opens a selector of years. |
| __minYear__   | 1000 | number | Minimum allowed year in calendar. Cannot be less than 1000. |
| __maxYear__   | 9999 | number | Maximum allowed year in calendar. Cannot be more than 9999. |
| __disableUntil__   | no default value | [IMyDate](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-date.interface.ts) | Disable dates backward starting from the given date. For example: {year: 2016, month: 6, day: 26}. To reset existing disableUntil value set: {year: 0, month: 0, day: 0} |
| __disableSince__   | no default value | [IMyDate](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-date.interface.ts) | Disable dates forward starting from the given date. For example: {year: 2016, month: 7, day: 22}. To reset existing disableSince value set: {year: 0, month: 0, day: 0} |
| __disableDates__   | no default value | Array<[IMyDate](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-date.interface.ts)> | Disable single dates one by one. Array of disabled dates. For example: [{year: 2016, month: 11, day: 14}, {year: 2016, month: 1, day: 15}]. Value of year or month can be zero. If it is zero it affects all years/months. For example disable first day of every month: [{year: 0, month: 0, day: 1}]. To reset existing disableDates value set empty array to it. |
| __enableDates__   | no default value | Array<[IMyDate](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-date.interface.ts)> | Enable given dates one by one if the date is disabled. For example if you disable the date range and want to enable some dates in range. Array of enabled days. For example: [{year: 2016, month: 11, day: 14}, {year: 2016, month: 1, day: 15}]. Value of year or month can be zero. If it is zero it affects all years/months. For example enable first day of every month: [{year: 0, month: 0, day: 1}]. To reset existing enableDates value set empty array to it. |
| __disableDateRanges__   | no default value | Array<[IMyDateRange](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-date-range.interface.ts)> | Disable date ranges. For example: [{begin: {year: 2016, month: 11, day: 14}, end: {year: 2016, month: 11, day: 20}}]. To reset existing disableDateRanges value set empty array to it. |
| __disableWeekends__   | false | boolean | Disable weekends (Saturday and Sunday). |
| __disableWeekdays__   | no default value | Array< string > | Disable weekdays. Array of weekdays to disable. Weekdays are same strings as the __firstDayOfWeek__ option. For example: ['tu', 'we'] which disables Tuesdays and Wednesdays. |
| __markDates__   | no default value | Array<[IMyMarkedDates](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-marked-dates.interface.ts)> | Mark dates for different colors. For example: [{dates: [{year: 2016, month: 11, day: 14}, {year: 2016, month: 12, day: 16}], color: '#004198'}, {dates: [{year: 2017, month: 10, day: 1}, {year: 2017, month: 11, day: 4}], color: 'green'}]. To reset existing markDates value set empty array to it. |
| __markWeekends__   | no default value | [IMyMarkedDate](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-marked-date.interface.ts) | Mark weekends (Saturday and Sunday). For example: {marked: true, color: 'red'}. Value of color can be any CSS color code. To reset existing markWeekends set: {marked: false, color: ''} |
| __disableHeaderButtons__   | true | boolean | Prevent to change the calendar view with header buttons if previous or next month are fully disabled by disableUntil or disableSince. |
| __showWeekNumbers__   | false | boolean | Are week numbers visible or not on calendar. Can be used if __firstDayOfWeek = mo__. |
| __selectorHeight__   | 232px | string | Selector height in pixels. |
| __selectorWidth__   | 252px | string | Selector width in pixels. |
| __alignSelectorRight__   | false | boolean | Align selector right. |
| __openSelectorTopOfInput__   | false | boolean | Open selector top of input field. The selector arrow cannot be shown if this option is true. |
| __closeSelectorOnDateSelect__ | true | boolean | Is selector closed or not on a date select. |
| __closeSelectorOnDocumentClick__ | true | boolean | Is selector closed or not on document click. |
| __allowSelectionOnlyInCurrentMonth__ | true | boolean | Is a date selection allowed or not other than current month. |
| __showSelectorArrow__   | true | boolean | Is selector (calendar) arrow shown or not. |
| __appendSelectorToBody__   | false | boolean | Is selector (calendar) appended to body element or not. |
| __focusInputOnDateSelect__   | true | boolean | Is the input box focused after a date select. |
| __ariaLabelPrevMonth__   | Previous Month | string | Aria label text of previous month button. |
| __ariaLabelNextMonth__   | Next Month | string | Aria label text of next month button. |
| __ariaLabelPrevYear__   | Previous Year | string | Aria label text of previous year button. |
| __ariaLabelNextYear__   | Next Year | string | Aria label text of next year button. |

* Example of the options data (not all properties listed):
```ts
  myOptions: INgxMyDpOptions = {
      todayBtnTxt: 'Today',
      dateFormat: 'yyyy-mm-dd',
      firstDayOfWeek: 'mo',
      sunHighlight: true,
      disableUntil: {year: 2016, month: 8, day: 10}
  };
```

### defaultMonth attribute

If initial date is not specified, when the calendar is opened, it will
ordinarily default to selecting the current date. If you would prefer
a different year and month to be the default for a freshly chosen date
picking operation, specify a __defaultMonth__ attribute.

Value of the defaultMonth attribute can be:
  * [IMyDefaultMonth](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-default-month.interface.ts) object. The value of __defMonth__ property can be a string which contain year number and month number separated by delimiter. The delimiter can be any special character. For example: __08-2016__ or __08/2016__.
  * a string which contain year number and month number separated by delimiter. The delimiter can be any special character. For example: __08-2016__ or __08/2016__.

## Functions

You can can call functions of the directive. Define local variable to input field like below:
```html
<input ngx-mydatepicker name="mydate" [(ngModel)]="model" [options]="myOptions" #dp="ngx-mydatepicker"/>
```
This __#dp="ngx-mydatepicker"__ defines the local variable named __dp__. You can use it to call functions of the directive
for example __(click)="dp.openCalendar()"__.

### openCalendar function

Opens the calendar. For example:
```html
<button type="button" (click)="dp.openCalendar()">Open</button>
```

### closeCalendar function

Closes the calendar. For example:
```html
<button type="button" (click)="dp.closeCalendar()">Close</button>
```

### toggleCalendar function

Closes the calendar if it is open and opens the calendar if it is closed. For example:
```html
<button type="button" (click)="dp.toggleCalendar()">Toggle</button>
```

### clearDate function

Clears the date from the input box and model. For example:
```html
<button type="button" (click)="dp.clearDate()">Clear</button>
```

### isDateValid function

Returns true if the date in the input box is valid. Otherwise it returns false. This function also calls the __inputFieldChanged__ callback.
```html
<input ngx-mydatepicker [(ngModel)]="model" [options]="myDatePickerOptions" #dp="ngx-mydatepicker"/>
```

```ts
@ViewChild('dp') ngxdp: NgxMyDatePickerDirective;

checkDateValidity(): void {
    let valid: boolean = this.ngxdp.isDateValid();
    console.log('Valid date in the input box: ', valid);
}
```

## Callbacks

### dateChanged callback
  * called when the date is selected, removed or input field typing is valid
  * event parameter:
    * event.date: Date object in the following format: { day: 22, month: 11, year: 2016 }
    * event.jsdate: Javascript Date object
    * event.formatted: Date string in the same format as dateFormat option is: '2016-11-22'
    * event.epoc: Epoc time stamp number: 1479765600
  * event parameter type is [IMyDateModel](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-date-model.interface.ts)

  * Example of the dateChanged callback:
  ```js
  onDateChanged(event: IMyDateModel) {
    console.log('onDateChanged(): ', event.date, ' - jsdate: ', new Date(event.jsdate).toLocaleDateString(), ' - formatted: ', event.formatted, ' - epoc timestamp: ', event.epoc);
  }
  ```

### inputFieldChanged callback
  * called when the value change in the input field, date is selected or date is cleared (can be used in validation, returns true or false indicating is date valid or not in the input field)
  * event parameter:
    * event.value: Value of the input field. For example: '2016-11-22'
    * event.dateFormat: Date format string in the same format as dateFormat option is. For example: 'yyyy-mm-dd'
    * event.valid: Boolean value indicating is the input field value valid or not. For example: true
  * event parameter type is [IMyInputFieldChanged](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-input-field-changed.interface.ts)

  * Example of the input field changed callback:
  ```js
  onInputFieldChanged(event: IMyInputFieldChanged) {
    console.log('onInputFieldChanged(): Value: ', event.value, ' - dateFormat: ', event.dateFormat, ' - valid: ', event.valid);
  }
  ```

### calendarViewChanged callback
  * called when the calendar view change (year or month change)
  * event parameter:
    * event.year: Year number in calendar. For example: 2016
    * event.month: Month number in calendar. For example: 11
    * event.first: First day of selected month and year. Type of [IMyWeekday](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-weekday.interface.ts). For example: {number: 1, weekday: "tu"}
    * event.last: Last day of selected month and year. Type of [IMyWeekday](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-weekday.interface.ts). For example: {number: 30, weekday: "we"}
  * event parameter type is [IMyCalendarViewChanged](https://github.com/kekeh/ngx-mydatepicker/blob/master/src/ngx-my-date-picker/interfaces/my-calendar-view-changed.interface.ts)
  * values of the weekday property are same as values of the __firstDayOfWeek__ option

  * Example of the calendar view changed callback:
  ```js
  onCalendarViewChanged(event: IMyCalendarViewChanged) {
    console.log('onCalendarViewChanged(): Year: ', event.year, ' - month: ', event.month, ' - first: ', event.first, ' - last: ', event.last);
  }
  ```

### calendarToggle callback
  * called when the calendar is opened or closed
    * event: number from 1 to 4 indicating the reason of the event
      * 1 = calendar opened
      * 2 = calendar closed by date select
      * 3 = calendar closed by calendar button
      * 4 = calendar closed by outside click (document click)
      * 5 = calendar closed by ESC key

  * Example of the calendar toggle callback:
  ```js
    onCalendarToggle(event: number): void {
        console.log('onCalendarClosed(): Reason: ', event);
    }
  ```

## Development of this component

* At first fork and clone this repo.

* Install all dependencies:
  1. __npm install__
  2. __npm install --global gulp-cli__

* Build the __npmdist__ folder and execute __tslint__:
  1. __gulp all__

* Execute unit tests and coverage (output is generated to the __test-output__ folder):
  1. __npm test__

* Run sample application:
  1. __npm start__
  2. Open __http://localhost:5000__ to browser

* Build a local npm installation package:
  1. __gulp all__
  2. __cd npmdist__
  3. __npm pack__
    * local installation package is created to the __npmdist__ folder. For example: __ngx-mydatepicker-0.0.1.tgz__

* Install local npm package to your project:
  1. __npm install path_to_npmdist/ngx-mydatepicker-0.0.1.tgz__

## Demo
Online demo is [here](http://kekeh.github.io/ngx-mydatepicker)

## Compatibility (tested with)
* Firefox (latest)
* Chrome (latest)
* Chromium (latest)
* Edge
* IE11
* Safari

## License
* License: MIT

## Author
* Author: kekeh

## Keywords
* Date picker
* Angular2+
* typescript
