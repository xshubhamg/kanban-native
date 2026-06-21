export class Icons {
  private static paths: Record<string, string> = {
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>'
  };

  /**
   * Returns a Lucide icon as an HTML string
   * @param name The name of the icon (e.g. 'plus', 'trash')
   * @param className Optional CSS classes (e.g. 'icon-sm')
   * @param size Optional dimensions (defaults to 24px)
   */
  public static get(name: string, className = '', size = 24): string {
    const paths = this.paths[name] || '';
    if (!paths) {
      console.warn(`Icon "${name}" not found`);
    }
    return `
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="${size}" 
        height="${size}" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        class="lucide lucide-${name} ${className}"
      >
        ${paths}
      </svg>
    `.trim();
  }
}
