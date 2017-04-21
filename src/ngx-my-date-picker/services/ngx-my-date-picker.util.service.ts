import { Injectable } from "@angular/core";
import { IMyDateModel } from "../interfaces/my-date-model.interface";
import { IMyDate } from "../interfaces/my-date.interface";
import { IMyDateRange } from "../interfaces/my-date-range.interface";
import { IMyMonth } from "../interfaces/my-month.interface";
import { IMyMonthLabels } from "../interfaces/my-month-labels.interface";
import { IMyMarkedDates } from "../interfaces/my-marked-dates.interface";
import { IMyMarkedDate } from "../interfaces/my-marked-date.interface";

@Injectable()
export class UtilService {
    isDateValid(dateStr: string, dateFormat: string, minYear: number, maxYear: number, disableUntil: IMyDate, disableSince: IMyDate, disableWeekends: boolean, disableDates: Array<IMyDate>, disableDateRanges: Array<IMyDateRange>, monthLabels: IMyMonthLabels, enableDates: Array<IMyDate>): IMyDate {
        let daysInMonth: Array<number> = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let isMonthStr: boolean = dateFormat.indexOf("mmm") !== -1;
        let returnDate: IMyDate = {day: 0, month: 0, year: 0};

        if (dateStr.length !== dateFormat.length && !isMonthStr) {
            return returnDate;
        }

        let separator: string = dateFormat.replace(/[dmy]/g, "")[0];

        let parts: Array<string> = dateStr.split(separator);
        if (parts.length !== 3) {
            return returnDate;
        }

        let month: number = isMonthStr ? this.parseDatePartMonthName(dateFormat, dateStr, "mmm", monthLabels) : this.parseDatePartNumber(dateFormat, dateStr, "mm");
        let day: number = this.parseDatePartNumber(dateFormat, dateStr, "dd", monthLabels[month]);
        let year: number = this.parseDatePartNumber(dateFormat, dateStr, "yyyy", monthLabels[month]);

        if (day !== -1 && month !== -1 && year !== -1) {
            if (year < minYear || year > maxYear || month < 1 || month > 12) {
                return returnDate;
            }

            let date: IMyDate = {year: year, month: month, day: day};

            if (this.isDisabledDate(date, disableUntil, disableSince, disableWeekends, disableDates, disableDateRanges, enableDates)) {
                return returnDate;
            }

            if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
                daysInMonth[1] = 29;
            }

            if (day < 1 || day > daysInMonth[month - 1]) {
                return returnDate;
            }

            // Valid date
            return date;
        }
        return returnDate;
    }

    isMonthLabelValid(monthLabel: string, monthLabels: IMyMonthLabels, checkContains: boolean = false): number {
        for (let key = 1; key <= 12; key++) {
            if (checkContains) {
                if (monthLabels[key].toLowerCase().indexOf(monthLabel.toLowerCase()) !== -1) {
                    return key;
                }
            }
            else {
                if (monthLabel.toLowerCase() === monthLabels[key].toLowerCase()) {
                    return key;
                }
            }
        }
        return -1;
    }

    isYearLabelValid(yearLabel: number, minYear: number, maxYear: number): number {
        if (yearLabel >= minYear && yearLabel <= maxYear) {
            return yearLabel;
        }
        return -1;
    }

    parseDatePartNumber(dateFormat: string, dateString: string, datePart: string, monthLabel?: string): number {
        let pos: number = dateFormat.indexOf(datePart);
        if (pos !== -1) {
            var monthStrPos = dateFormat.indexOf('mmm');
            if (monthStrPos !== -1 && monthLabel) {
                pos += (monthLabel.length - 'mmm'.length);
            }
            let value: string = dateString.substring(pos, pos + datePart.length);
            if (!/^\d+$/.test(value)) {
                return -1;
            }
            return parseInt(value);
        }
        return -1;
    }

    parseDatePartMonthName(dateFormat: string, dateString: string, datePart: string, monthLabels: IMyMonthLabels): number {
        let pos: number = dateFormat.indexOf(datePart);
        if (pos !== -1) {
            return this.isMonthLabelValid(dateString.substring(pos, pos + datePart.length), monthLabels, true);
        }
        return -1;
    }

    parseDefaultMonth(monthString: string): IMyMonth {
        let month: IMyMonth = {monthTxt: "", monthNbr: 0, year: 0};
        if (monthString !== "") {
            let split = monthString.split(monthString.match(/[^0-9]/)[0]);
            month.monthNbr = split[0].length === 2 ? parseInt(split[0]) : parseInt(split[1]);
            month.year = split[0].length === 2 ? parseInt(split[1]) : parseInt(split[0]);
        }
        return month;
    }

    isDisabledDate(date: IMyDate, disableUntil: IMyDate, disableSince: IMyDate, disableWeekends: boolean, disableDates: Array<IMyDate>, disableDateRanges: Array<IMyDateRange>, enableDates: Array<IMyDate>): boolean {
        for (let d of enableDates) {
            if (d.year === date.year && d.month === date.month && d.day === date.day) {
                return false;
            }
        }

        let dateMs: number = this.getTimeInMilliseconds(date);
        if (this.isInitializedDate(disableUntil) && dateMs <= this.getTimeInMilliseconds(disableUntil)) {
            return true;
        }

        if (this.isInitializedDate(disableSince) && dateMs >= this.getTimeInMilliseconds(disableSince)) {
            return true;
        }

        if (disableWeekends) {
            let dayNbr = this.getDayNumber(date);
            if (dayNbr === 0 || dayNbr === 6) {
                return true;
            }
        }

        for (let d of disableDates) {
            if (d.year === date.year && d.month === date.month && d.day === date.day) {
                return true;
            }
        }

        for (let d of disableDateRanges) {
            if (this.isInitializedDate(d.begin) && this.isInitializedDate(d.end) && dateMs >= this.getTimeInMilliseconds(d.begin) && dateMs <= this.getTimeInMilliseconds(d.end)) {
                return true;
            }
        }
        return false;
    }

    isMarkedDate(date: IMyDate, markedDates: Array<IMyMarkedDates>, markWeekends: IMyMarkedDate): IMyMarkedDate {
        for (let md of markedDates) {
            for (let d of md.dates) {
                if (d.year === date.year && d.month === date.month && d.day === date.day) {
                    return {marked: true, color: md.color};
                }
            }
        }
        if (markWeekends && markWeekends.marked) {
            let dayNbr = this.getDayNumber(date);
            if (dayNbr === 0 || dayNbr === 6) {
                return {marked: true, color: markWeekends.color};
            }
        }
        return {marked: false, color: ""};
    }

    getWeekNumber(date: IMyDate): number {
        let d: Date = new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
        d.setDate(d.getDate() + (d.getDay() === 0 ? -3 : 4 - d.getDay()));
        return Math.round(((d.getTime() - new Date(d.getFullYear(), 0, 4).getTime()) / 86400000) / 7) + 1;
    }

    isMonthDisabledByDisableUntil(date: IMyDate, disableUntil: IMyDate): boolean {
        return this.isInitializedDate(disableUntil) && this.getTimeInMilliseconds(date) <= this.getTimeInMilliseconds(disableUntil);
    }

    isMonthDisabledByDisableSince(date: IMyDate, disableSince: IMyDate): boolean {
        return this.isInitializedDate(disableSince) && this.getTimeInMilliseconds(date) >= this.getTimeInMilliseconds(disableSince);
    }

    getDateModel(date: IMyDate, dateFormat: string, monthLabels: IMyMonthLabels): IMyDateModel {
        return {date: date, jsdate: this.getDate(date), formatted: this.formatDate(date, dateFormat, monthLabels), epoc: Math.round(this.getTimeInMilliseconds(date) / 1000.0)};
    }

    formatDate(date: IMyDate, dateFormat: string, monthLabels: IMyMonthLabels): string {
        let formatted: string = dateFormat.replace("yyyy", String(date.year)).replace("dd", this.preZero(date.day));
        return dateFormat.indexOf("mmm") !== -1 ? formatted.replace("mmm", monthLabels[date.month]) : formatted.replace("mm", this.preZero(date.month));
    }

    preZero(val: number): string {
        return val < 10 ? "0" + val : String(val);
    }

    isInitializedDate(date: IMyDate): boolean {
        return date.year !== 0 && date.month !== 0 && date.day !== 0;
    }

    getTimeInMilliseconds(date: IMyDate): number {
        return this.getDate(date).getTime();
    }

    getDate(date: IMyDate): Date {
        return new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
    }

    getDayNumber(date: IMyDate): number {
        let d: Date = new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
        return d.getDay();
    }
}