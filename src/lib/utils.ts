export function formatDate(dateStr: any): string {
    if (!dateStr) return '';
    let parsedString = dateStr;
    // Check if it's a Go sql.NullTime object
    if (typeof dateStr === 'object' && 'Time' in dateStr) {
        if (!dateStr.Valid) return 'Unknown Date';
        parsedString = dateStr.Time;
    }
    const date = new Date(parsedString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-GB');
}

export function formatLongDate(dateStr: any): string {
    if (!dateStr) return '';
    let parsedString = dateStr;
    if (typeof dateStr === 'object' && 'Time' in dateStr) {
        if (!dateStr.Valid) return '';
        parsedString = dateStr.Time;
    }
    const date = new Date(parsedString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function getYear(dateStr: any): string {
    if (!dateStr) return '';
    let parsedString = dateStr;
    if (typeof dateStr === 'object' && 'Time' in dateStr) {
        if (!dateStr.Valid) return '';
        parsedString = dateStr.Time;
    }
    const date = new Date(parsedString);
    if (isNaN(date.getTime())) return '';
    return date.getFullYear().toString();
}
