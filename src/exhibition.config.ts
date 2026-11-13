export interface ExhibitionConfig {
  exhibitionName: string;
  exhibitionSubtitle: string;
  exhibitionTagline: string;
  SHOW_ALTERNATE_VERSIONS: boolean;
  appsHubUrl: string;
}

export const EXHIBITION_CONFIG: ExhibitionConfig = {
  exhibitionName: 'معرض MD7',
  exhibitionSubtitle: 'البوابة التفاعلية لصروح المعرفة والفكر والتكنولوجيا',
  exhibitionTagline: '«ن والقلم وما يسطرون · البداية الأزلية لكل صرح معماري خالد»',
  SHOW_ALTERNATE_VERSIONS: true,
  appsHubUrl: 'https://md7-group.ai.studio/',
};
