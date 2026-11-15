export interface PlatformFlags {
  readonly ads_disabled: true;
  readonly rotation_disabled: true;
}

export const PLATFORM_FLAGS: PlatformFlags = {
  ads_disabled: true,
  rotation_disabled: true,
};

export interface ExhibitionConfig {
  exhibitionName: string;
  platformName: string;
  platformTagline: string;
  exhibitionSubtitle: string;
  exhibitionTagline: string;
  SHOW_ALTERNATE_VERSIONS: boolean;
  appsHubUrl: string;
}

export const EXHIBITION_CONFIG: ExhibitionConfig = {
  exhibitionName: 'منصة الكتاب · معرض MD7',
  platformName: 'منصة الكتاب',
  platformTagline: 'منصة الكتاب • كل ما يخص النشر والقراءة',
  exhibitionSubtitle: 'منصة تفاعلية للناشرين والقراء في منظومة MD7 الموحدة',
  exhibitionTagline: '«ن والقلم وما يسطرون · البداية الأزلية لكل صرح معماري خالد»',
  SHOW_ALTERNATE_VERSIONS: true,
  appsHubUrl: 'https://md7-group.ai.studio/',
};
