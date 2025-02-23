export function capitalizeString(str: string) {
    if (!str) return str; // handle empty or undefined strings
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}