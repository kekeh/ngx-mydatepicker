import { Directive, Input, ComponentRef, ElementRef, ViewContainerRef, Renderer, ChangeDetectorRef, ComponentFactoryResolver, forwardRef, EventEmitter, Output, SimpleChanges, OnChanges, HostListener } from "@angular/core";
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from "@angular/forms";

import { IMyDate, IMyOptions, IMyDateModel, IMyCalendarViewChanged, IMyInputFieldChanged, IMySelectorPosition } from "./interfaces/index";
import { NgxMyDatePicker } from "./ngx-my-date-picker.component";
import { UtilService } from "./services/ngx-my-date-picker.util.service";
import { NgxMyDatePickerConfig } from "./services/ngx-my-date-picker.config";
import { CalToggle } from "./enums/cal-toggle.enum";
import { Year } from "./enums/year.enum";
import { KeyCode } from "./enums/key-code.enum";

const NGX_DP_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NgxMyDatePickerDirective),
    multi: true
};

const NGX_DP_VALIDATORS = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => NgxMyDatePickerDirective),
    multi: true
};

@Directive({
    selector: "[ngx-mydatepicker]",
    exportAs: "ngx-mydatepicker",
    providers: [UtilService, NGX_DP_VALUE_ACCESSOR, NGX_DP_VALIDATORS]
})
export class NgxMyDatePickerDirective implements OnChanges, ControlValueAccessor, Validator {
    @Input() options: IMyOptions;
    @Input() defaultMonth: string;

    @Output() dateChanged: EventEmitter<IMyDateModel> = new EventEmitter<IMyDateModel>();
    @Output() inputFieldChanged: EventEmitter<IMyInputFieldChanged> = new EventEmitter<IMyInputFieldChanged>();
    @Output() calendarViewChanged: EventEmitter<IMyCalendarViewChanged> = new EventEmitter<IMyCalendarViewChanged>();
    @Output() calendarToggle: EventEmitter<number> = new EventEmitter<number>();

    private cRef: ComponentRef<NgxMyDatePicker> = null;
    private inputText: string = "";
    private preventClose: boolean = false;
    private disabled = false;

    private opts: IMyOptions;
    private model: IMyDateModel;

    onChangeCb: (_: any) => void = () => { };
    onTouchedCb: () => void = () => { };

    constructor(private utilService: UtilService,
                private vcRef: ViewContainerRef,
                private cfr: ComponentFactoryResolver,
                private renderer: Renderer,
                private cdr: ChangeDetectorRef,
                private elem: ElementRef,
                private config: NgxMyDatePickerConfig) {
        this.opts = Object.assign({}, config);
        this.parseOptions(config);
    }

    @HostListener("keyup", ["$event"]) onKeyUp(evt: KeyboardEvent) {
        if (this.ignoreKeyPress(evt.keyCode)) {
            return;
        }
        else if (evt.keyCode === KeyCode.esc) {
            this.closeSelector(CalToggle.CloseByEsc);
        }
        else {
            let date: IMyDate = this.utilService.isDateValid(this.elem.nativeElement.value, this.opts.dateFormat, this.opts.minYear, this.opts.maxYear, this.opts.disableUntil, this.opts.disableSince, this.opts.disableWeekends, this.opts.disableDates, this.opts.disableDateRanges, this.opts.monthLabels, this.opts.enableDates);
            if (this.utilService.isInitializedDate(date)) {
                let dateModel: IMyDateModel = this.utilService.getDateModel(date, this.opts.dateFormat, this.opts.monthLabels, this.elem.nativeElement.value);
                this.emitDateChanged(dateModel);
                this.updateModel(dateModel);
                this.emitInputFieldChanged(dateModel.formatted, true);
                if (this.opts.closeSelectorOnDateSelect) {
                    this.closeSelector(CalToggle.CloseByDateSel);
                }
                else if (this.cRef !== null) {
                    this.cRef.instance.setCalendarView(date);
                }
            }
            else {
                if (this.inputText !== this.elem.nativeElement.value) {
                    if (this.elem.nativeElement.value === "") {
                        this.clearDate();
                    }
                    else {
                        this.model = null;
                        this.onChangeCb(null);
                        this.emitInputFieldChanged(this.elem.nativeElement.value, false);
                    }
                }
            }
            this.inputText = this.elem.nativeElement.value;
        }
    }

    @HostListener("blur") onBlur() {
        this.onTouchedCb();
    }

    // wrapper with arrow function to preserve the use of 'this' word
    private onClickWrapper = (ev: MouseEvent) => { this.onClick(ev); };

    onClick(evt: MouseEvent) {
        if (this.opts.closeSelectorOnDocumentClick && !this.preventClose && evt.target && this.cRef !== null && this.elem.nativeElement !== evt.target && !this.cRef.location.nativeElement.contains(evt.target) && !this.disabled) {
            this.closeSelector(CalToggle.CloseByOutClick);
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty("options")) {
            this.parseOptions(changes["options"].currentValue);
            if (!changes["options"].isFirstChange()) {
                this.onChangeCb(this.model);
            }
        }

        if (changes.hasOwnProperty("defaultMonth")) {
            let dm: any = changes["defaultMonth"].currentValue;
            if (typeof dm === "object") {
                dm = dm.defMonth;
            }
            this.defaultMonth = dm;
        }
    }

    public parseOptions(opts: IMyOptions): void {
        if (opts !== undefined) {
            Object.keys(opts).forEach((k) => {
                (<IMyOptions>this.opts)[k] = opts[k];
            });
        }
        if (this.opts.minYear < Year.min) {
            this.opts.minYear = Year.min;
        }
        if (this.opts.maxYear > Year.max) {
            this.opts.maxYear = Year.max;
        }
    }

    public writeValue(value: any): void {
        if (!this.disabled) {
            if (value && (value["date"] || value["jsdate"])) {
                let formatted: string = this.utilService.formatDate(value["date"] ? value["date"] : this.jsDateToMyDate(value["jsdate"]), this.opts.dateFormat, this.opts.monthLabels);
                let date: IMyDate = this.utilService.isDateValid(formatted, this.opts.dateFormat, this.opts.minYear, this.opts.maxYear, this.opts.disableUntil, this.opts.disableSince, this.opts.disableWeekends, this.opts.disableDates, this.opts.disableDateRanges, this.opts.monthLabels, this.opts.enableDates);
                this.setInputValue(formatted);
                this.emitInputFieldChanged(formatted, this.utilService.isInitializedDate(date));
            }
            else if (value === null || value === "") {
                this.setInputValue("");
                this.emitInputFieldChanged("", false);
            }
        }
    }

    public registerOnChange(fn: any): void {
        this.onChangeCb = fn;
    }

    public registerOnTouched(fn: any): void {
        this.onTouchedCb = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.renderer.setElementProperty(this.elem.nativeElement, "disabled", isDisabled);

        if (isDisabled) {
            this.closeCalendar();
        }
    }

    public validate(c: AbstractControl): { [p: string]: any } {
        if (this.elem.nativeElement.value === null || this.elem.nativeElement.value === "") {
            return null;
        }
        let date: IMyDate = this.utilService.isDateValid(this.elem.nativeElement.value, this.opts.dateFormat, this.opts.minYear, this.opts.maxYear, this.opts.disableUntil, this.opts.disableSince, this.opts.disableWeekends, this.opts.disableDates, this.opts.disableDateRanges, this.opts.monthLabels, this.opts.enableDates);
        if (!this.utilService.isInitializedDate(date)) {
            return {invalidDateFormat: true};
        }
        return null;
    }

    public openCalendar(): void {
        if (this.disabled) {
            return;
        }
        this.preventClose = true;
        this.cdr.detectChanges();
        if (this.cRef === null) {
            this.cRef = this.vcRef.createComponent(this.cfr.resolveComponentFactory(NgxMyDatePicker));
            this.appendSelector(this.cRef.location.nativeElement);
            this.cRef.instance.initialize(
                this.opts,
                this.defaultMonth,
                this.getSelectorPosition(this.elem.nativeElement),
                this.elem.nativeElement.value,
                (dm: IMyDateModel, close: boolean) => {
                    this.focusToInput();
                    this.emitDateChanged(dm);
                    this.emitInputFieldChanged(dm.formatted, true);
                    this.updateModel(dm);
                    if (close) {
                        this.closeSelector(CalToggle.CloseByDateSel);
                    }
                },
                (cvc: IMyCalendarViewChanged) => {
                    this.emitCalendarChanged(cvc);
                },
                () => {
                    this.closeSelector(CalToggle.CloseByEsc);
                }
            );
            this.emitCalendarToggle(CalToggle.Open);
        }
        setTimeout(() => {
            this.preventClose = false;
        }, 50);
    }

    public closeCalendar(): void {
        this.closeSelector(CalToggle.CloseByCalBtn);
    }

    public toggleCalendar(): void {
        if (this.disabled) {
            return;
        }
        if (this.cRef === null) {
            document.addEventListener("click", this.onClickWrapper);
            this.openCalendar();
        }
        else {
            document.removeEventListener("click", this.onClickWrapper);
            this.closeSelector(CalToggle.CloseByCalBtn);
        }
    }

    public clearDate(): void {
        if (this.disabled) {
            return;
        }
        this.emitDateChanged({date: {year: 0, month: 0, day: 0}, jsdate: null, formatted: "", epoc: 0});
        this.emitInputFieldChanged("", false);
        this.model = null;
        this.onChangeCb(null);
        this.onTouchedCb();
        this.setInputValue("");
        this.closeSelector(CalToggle.CloseByCalBtn);
    }

    public isDateValid(): boolean {
        if (this.elem.nativeElement.value !== "") {
            let date: IMyDate = this.utilService.isDateValid(this.elem.nativeElement.value, this.opts.dateFormat, this.opts.minYear, this.opts.maxYear, this.opts.disableUntil, this.opts.disableSince, this.opts.disableWeekends, this.opts.disableDates, this.opts.disableDateRanges, this.opts.monthLabels, this.opts.enableDates);
            if (this.utilService.isInitializedDate(date)) {
                this.emitInputFieldChanged(this.elem.nativeElement.value, true);
                return true;
            }
        }
        this.emitInputFieldChanged(this.elem.nativeElement.value, false);
        return false;
    }

    private ignoreKeyPress(keyCode: number): boolean {
        return keyCode === KeyCode.leftArrow || keyCode === KeyCode.rightArrow || keyCode === KeyCode.upArrow || keyCode === KeyCode.downArrow || keyCode === KeyCode.tab || keyCode === KeyCode.shift;
    }

    private closeSelector(reason: number): void {
        if (this.cRef !== null) {
            this.vcRef.remove(this.vcRef.indexOf(this.cRef.hostView));
            this.cRef = null;
            this.emitCalendarToggle(reason);
        }
    }

    private updateModel(model: IMyDateModel): void {
        this.model = model;
        this.setInputValue(model.formatted);
        this.onChangeCb(model);
        this.onTouchedCb();
    }

    private setInputValue(value: string): void {
        this.inputText = value;
        this.renderer.setElementProperty(this.elem.nativeElement, "value", value);
    }

    private focusToInput(): void {
        setTimeout(() => {
            this.elem.nativeElement.focus();
        });
    }

    private emitDateChanged(dateModel: IMyDateModel): void {
        this.dateChanged.emit(dateModel);
    }

    private emitInputFieldChanged(value: string, valid: boolean): void {
        this.inputFieldChanged.emit({value: value, dateFormat: this.opts.dateFormat, valid: valid});
    }

    private emitCalendarChanged(cvc: IMyCalendarViewChanged) {
        this.calendarViewChanged.emit(cvc);
    }

    private emitCalendarToggle(reason: number): void {
        this.calendarToggle.emit(reason);
    }

    private jsDateToMyDate(date: Date): IMyDate {
        return {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};
    }

    private appendSelector(elem: any): void {
        if (this.opts.appendSelectorToBody) {
            document.querySelector("body").appendChild(elem);
        }
    }

    private getSelectorPosition(elem: any): IMySelectorPosition {
        let top: number = 0;
        let left: number = 0;

        if (this.opts.appendSelectorToBody) {
            let b: any = document.body.getBoundingClientRect();
            let e: any = elem.getBoundingClientRect();
            top = e.top - b.top;
            left = e.left - b.left;
        }

        if (this.opts.openSelectorTopOfInput) {
            top = top - this.getSelectorDimension(this.opts.selectorHeight) - 2;
        }
        else {
            top = top + elem.offsetHeight + (this.opts.showSelectorArrow ? 12 : 2);
        }

        if (this.opts.alignSelectorRight) {
            left = left + elem.offsetWidth - this.getSelectorDimension(this.opts.selectorWidth);
        }
        return {top: top + "px", left: left + "px"};
    }

    private getSelectorDimension(value: string): number {
        return Number(value.replace("px", ""));
    }
}