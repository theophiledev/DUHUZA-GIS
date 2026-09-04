import type { LanguageCode } from '../types';

export type TranslationKey =
  | 'appName'
  | 'tagline'
  | 'home'
  | 'listings'
  | 'market'
  | 'services'
  | 'jobs'
  | 'gis'
  | 'gisNav'
  | 'login'
  | 'register'
  | 'logout'
  | 'dashboard'
  | 'search'
  | 'filter'
  | 'category'
  | 'province'
  | 'district'
  | 'sector'
  | 'cell'
  | 'village'
  | 'price'
  | 'type'
  | 'sale'
  | 'rent'
  | 'contactWhatsapp'
  | 'loading'
  | 'error'
  | 'noResults'
  | 'viewDetails'
  | 'createListing'
  | 'myListings'
  | 'submitForReview'
  | 'pendingReview'
  | 'approved'
  | 'rejected'
  | 'draft'
  | 'published'
  | 'approve'
  | 'reject'
  | 'comment'
  | 'pendingQueue'
  | 'createMarketItem'
  | 'myMarketItems'
  | 'postJob'
  | 'myJobs'
  | 'apply'
  | 'myApplications'
  | 'gisRequest'
  | 'serviceProvider'
  | 'users'
  | 'createUser'
  | 'name'
  | 'email'
  | 'phone'
  | 'password'
  | 'save'
  | 'cancel'
  | 'description'
  | 'title'
  | 'location'
  | 'status'
  | 'actions'
  | 'welcomeBack'
  | 'browseProperties'
  | 'heroSubtitle'
  | 'allCategories'
  | 'house'
  | 'land'
  | 'vehicle'
  | 'motorcycle'
  | 'minPrice'
  | 'maxPrice'
  | 'language'
  | 'clientDashboard'
  | 'agentDashboard'
  | 'managerDashboard'
  | 'adminDashboard'
  | 'assignedGis'
  | 'registerAsProvider'
  | 'salaryRange'
  | 'deadline'
  | 'purpose'
  | 'parcelLocation'
  | 'assignAgent'
  | 'agentId'
  | 'markInProgress'
  | 'markCompleted'
  | 'reportUrl'
  | 'mediaUrls'
  | 'ownerInfo'
  | 'internalNotes'
  | 'attributes'
  | 'translations'
  | 'alreadyHaveAccount'
  | 'noAccount'
  | 'identifier'
  | 'role'
  | 'active'
  | 'suspended'
  | 'permissions'
  | 'errorLoadProperties'
  | 'errorLoadMarket'
  | 'errorLoadJobs'
  | 'errorLoadServices'
  | 'errorServerSubtitle'
  | 'tryAgain'
  | 'allDistricts'
  | 'allProvinces'
  | 'allSectors'
  | 'selectProvince'
  | 'selectDistrict'
  | 'selectSector'
  | 'selectCell'
  | 'selectVillage'
  | 'allTypes'
  | 'budgetAny'
  | 'budgetUnder10M'
  | 'budget10to50M'
  | 'budget50to100M'
  | 'budgetOver100M'
  | 'locationPlaceholder'
  | 'categoryElectronics'
  | 'categoryFurniture'
  | 'categoryProduce'
  | 'servicePlumbing'
  | 'serviceTransport'
  | 'serviceTutoring'
  | 'serviceTailoring'
  // GIS page specific keys
  | 'gisHeroTitle'
  | 'gisHeroSubtitle'
  | 'requestSurveyNow'
  | 'interactiveMap'
  | 'clickMapToPin'
  | 'surveyPurpose'
  | 'boundaryDemarcation'
  | 'topographicalSurvey'
  | 'landSubdivision'
  | 'titleTransferSurvey'
  | 'constructionPermit'
  | 'agriculturalMapping'
  | 'parcelSizeEst'
  | 'contactPhone'
  | 'clientNotes'
  | 'calcEstimate'
  | 'estCost'
  | 'surveyFeaturesTitle'
  | 'certifiedSurveyors'
  | 'certifiedSurveyorsDesc'
  | 'highPrecision'
  | 'highPrecisionDesc'
  | 'officialReports'
  | 'officialReportsDesc'
  | 'fastDelivery'
  | 'fastDeliveryDesc'
  | 'sampleSurveysTitle'
  | 'viewSampleReport'
  | 'trackSurveyTitle'
  | 'trackSurveyPlaceholder'
  | 'trackBtn'
  | 'parcelDetails'
  | 'upiNumber'
  | 'parcelArea'
  | 'coordinates'
  | 'surveySuccessMsg'
  | 'surveyLoginPrompt'
  // RBAC & Dashboard keys
  | 'roleAdmin'
  | 'roleManager'
  | 'roleAgent'
  | 'roleClient'
  | 'overview'
  | 'analytics'
  | 'activityFeed'
  | 'actionRequired'
  | 'moderationHub'
  | 'pendingItems'
  | 'canApproveProperty'
  | 'canApproveGis'
  | 'canApproveJobs'
  | 'canApproveMarket'
  | 'canApproveServices'
  | 'rejectionReason'
  | 'enterRejectionReason'
  | 'confirmAction'
  | 'resubmitListing'
  | 'statusChangedSuccess'
  | 'totalUsers'
  | 'totalListings'
  | 'activeListings'
  | 'pendingApprovals'
  | 'assignedMissions'
  | 'completedSurveys'
  | 'filterAll'
  | 'editUser'
  | 'managePermissions'
  | 'grantPermission'
  | 'revokePermission'
  | 'permissionSaved'
  | 'postNewListing'
  | 'myRecentActivity'
  | 'quickActions'
  | 'downloadReport'
  | 'viewApplicants'
  | 'applicantsCount'
  | 'applicationsSubmitted'
  | 'jobApplicationsTitle'
  | 'surveyProgress'
  | 'rejectionCommentLabel'
  | 'back'
  | 'collapse'
  | 'expand'
  | 'noPreview'
  | 'posted'
  | 'closes'
  | 'viewOpportunity'
  | 'openOpportunities'
  | 'duhuzaOpportunities'
  | 'findNextRole'
  | 'searchByLocation'
  | 'liveSource'
  | 'mifotraVacancies'
  | 'allOpportunities'
  | 'technology'
  | 'landAndGis'
  | 'operations'
  | 'marketing'
  | 'internships'
  | 'verifiedEmployer'
  | 'aboutOpportunity'
  | 'readyToApply'
  | 'submitApplication'
  | 'applyBy'
  | 'exploreEcosystem'
  | 'fastSecureVerified'
  | 'manageAccounts'
  | 'searchUsers'
  | 'forgotPassword'
  | 'forgotPasswordSubtitle'
  | 'resetPassword'
  | 'resetPasswordSubtitle'
  | 'sendResetCode'
  | 'resetCode'
  | 'enterResetCode'
  | 'codeSentNotice'
  | 'newPassword'
  | 'confirmPassword'
  | 'passwordsDoNotMatch'
  | 'passwordResetSuccess'
  | 'passwordChangedSuccess'
  | 'backToLogin'
  | 'profile'
  | 'myProfile'
  | 'profileOverview'
  | 'personalInfo'
  | 'securitySettings'
  | 'changePassword'
  | 'currentPassword'
  | 'updateProfile'
  | 'profileUpdatedSuccess'
  | 'memberSince'
  | 'accountDetails'
  | 'sessionSecurity'
  | 'sessionSecurityDesc'
  | 'inactivityTimeoutWarning'
  | 'sessionExpiredDueToInactivity'
  | 'stayActive'
  | 'viewProfile';

type Translations = Record<TranslationKey, string>;

const rw: Translations = {
  appName: 'Duhuza',
  tagline: 'Urubuga rw\'imitungo n\'ubukode',
  home: 'Ahabanza',
  listings: 'Imitungo',
  market: 'Isoko',
  services: 'Serivisi',
  jobs: 'Akazi',
  gis: 'GIS & Ipima',
  gisNav: 'GIS & Ipima',
  login: 'Injira',
  register: 'Iyandikishe',
  logout: 'Sohoka',
  dashboard: 'Ikibaho',
  search: 'Shakisha',
  filter: 'Suzuma',
  category: 'Icyiciro',
  province: 'Intara',
  district: 'Akarere',
  sector: 'Umurenge',
  cell: 'Akagari',
  village: 'Umudugudu',
  price: 'Igiciro',
  type: 'Ubwoko',
  sale: 'Kugurisha',
  rent: 'Ubukode',
  contactWhatsapp: 'Vugana kuri WhatsApp',
  loading: 'Tegereza...',
  error: 'Ikosa',
  noResults: 'Nta bisubizo bibonetse',
  viewDetails: 'Reba birambuye',
  createListing: 'Shyiraho itangazo',
  myListings: 'Amatangazo yanjye',
  submitForReview: 'Ohereza gusuzumwa',
  pendingReview: 'Gitegereje isuzuma',
  approved: 'Byemewe',
  rejected: 'Byanzwe',
  draft: 'Igishushanyo',
  published: 'Byatangajwe',
  approve: 'Emeza',
  reject: 'Wanga',
  comment: 'Igitekerezo',
  pendingQueue: 'Urutonde rutegekereje',
  createMarketItem: 'Shyiraho igicuruzwa',
  myMarketItems: 'Ibicuruzwa byanjye',
  postJob: 'Tanga akazi',
  myJobs: 'Akazi kanjye',
  apply: 'Saba',
  myApplications: 'Ubusabe bwanjye',
  gisRequest: 'Saba ikarita',
  serviceProvider: 'Serivisi yanjye',
  users: 'Abakoresha',
  createUser: 'Kora ukoresha',
  name: 'Amazina',
  email: 'Imeyili',
  phone: 'Telefone',
  password: 'Ijambo ry\'ibanga',
  save: 'Bika',
  cancel: 'Hagarika',
  description: 'Ibisobanuro',
  title: 'Umutwe',
  location: 'Aho biherereye',
  status: 'Imiterere',
  actions: 'Ibikorwa',
  welcomeBack: 'Murakaza neza',
  browseProperties: 'Shakisha imitungo',
  heroSubtitle: 'Shaka inzu, ubukode, ibicuruzwa n\'akazi — byose ahantu hamwe',
  allCategories: 'Ibyiciro byose',
  house: 'Inzu',
  land: 'Ubutaka',
  vehicle: 'Imodoka',
  motorcycle: 'Moto',
  minPrice: 'Igiciro gito',
  maxPrice: 'Igiciro gikomeye',
  language: 'Ururimi',
  clientDashboard: 'Ikibaho cy\'umukiriya',
  agentDashboard: 'Ikibaho cy\'umukozi',
  managerDashboard: 'Ikibaho cy\'umuyobozi',
  adminDashboard: 'Ikibaho cy\'umuyobozi mukuru',
  assignedGis: 'Ikarita yatanzwe',
  registerAsProvider: 'Iyandikishe nk\'utanga serivisi',
  salaryRange: 'Umushahara',
  deadline: 'Itariki y\'iherezo',
  purpose: 'Intego',
  parcelLocation: 'Aho ubutaka buherereye',
  assignAgent: 'Shyira umukozi',
  agentId: 'ID y\'umukozi',
  markInProgress: 'Birakora',
  markCompleted: 'Byarangiye',
  reportUrl: 'URL y\'raporo',
  mediaUrls: 'Amashusho (URL)',
  ownerInfo: 'Amakuru y\'nyir\'umutungo',
  internalNotes: 'Inyandiko z\'imbere',
  attributes: 'Ibiranga',
  translations: 'Ubuhinduzi',
  alreadyHaveAccount: 'Usanzwe ufite konti?',
  noAccount: 'Nta konti ufite?',
  identifier: 'Imeyili cyangwa telefone',
  role: 'Inshingano',
  active: 'Ikora',
  suspended: 'Yahagaritswe',
  permissions: 'Uburenganzira',
  errorLoadProperties: 'Ntibishoboka kwerekana imitungo',
  errorLoadMarket: 'Ntibishoboka kwerekana isoko',
  errorLoadJobs: 'Ntibishoboka kwerekana akazi',
  errorLoadServices: 'Ntibishoboka kwerekana serivisi',
  errorServerSubtitle: 'Dufite ikibazo cyo guhuza na seriveri zacu ubu. Gerageza nanone.',
  tryAgain: 'Ongera ugerageze',
  allDistricts: 'Uturere twose',
  allProvinces: 'Intara zose',
  allSectors: 'Imirenge yose',
  selectProvince: 'Hitamo intara',
  selectDistrict: 'Hitamo akarere',
  selectSector: 'Hitamo umurenge',
  selectCell: 'Hitamo akagari',
  selectVillage: 'Hitamo umudugudu',
  allTypes: 'Ubwoko bwose',
  budgetAny: 'Igiciro cyose',
  budgetUnder10M: 'Munsi ya 10M RWF',
  budget10to50M: '10M – 50M RWF',
  budget50to100M: '50M – 100M RWF',
  budgetOver100M: 'Hejuru ya 100M RWF',
  locationPlaceholder: 'Shakisha ahantu...',
  categoryElectronics: 'Ibikoresho bya elegitoroniki',
  categoryFurniture: 'Ibikoresho byo mu nzu',
  categoryProduce: 'Imbuto n\'imboga',
  servicePlumbing: 'Amazi n\'ubwubatsi',
  serviceTransport: 'Ubwikorezi',
  serviceTutoring: 'Kwigisha',
  serviceTailoring: 'Ubudozi',
  gisHeroTitle: 'Serivisi z\'Ikarita ya GIS no Gupima Ubutaka mu Rwanda',
  gisHeroSubtitle: 'Gupima imbibi zemewe n\'amategeko, amakarita ya UPI, ikoranabuhanga rya RTK GNSS mu gihugu hose.',
  requestSurveyNow: 'Saba gupimisha ikibanza',
  interactiveMap: 'Ikarita ifatika y\'Ubutaka na UPI',
  clickMapToPin: 'Kanda ku ikarita kugira ngo ushyireho aho ubutaka bwawe buherereye',
  surveyPurpose: 'Ubwoko bwo gupima',
  boundaryDemarcation: 'Gupima no kwemeza imbibi z\'ikibanza (UPI)',
  topographicalSurvey: 'Gupima imiterere y\'ubutaka (Topography 3D)',
  landSubdivision: 'Kugabanya ikibanza mo ibice (Subdivision)',
  titleTransferSurvey: 'Gupimisha guhererekanya icyangombwa cy\'ubutaka',
  constructionPermit: 'Gupimisha kwaka uruhushya rwo kubaka',
  agriculturalMapping: 'Gupima amashyamba n\'imirima minini',
  parcelSizeEst: 'Ingano y\'ikibanza (m² cyangwa hegitari)',
  contactPhone: 'Telefone yawe (WhatsApp)',
  clientNotes: 'Inyandiko z\'inyongera cyangwa numero ya UPI',
  calcEstimate: 'Kubarira igiciro cy\'igereranyo',
  estCost: 'Igiciro kigereranyije',
  surveyFeaturesTitle: 'Kuki uhitamo serivisi za GIS za Duhuza?',
  certifiedSurveyors: 'Abapima babifitiye impamyabumenyi',
  certifiedSurveyorsDesc: 'Abahanga bemewe n\'ikigo cy\'ubutaka RLMUA hamwe n\'ingaga z\'abapima.',
  highPrecision: 'Icyizere n\'ubunyamwuga bwa GNSS RTK',
  highPrecisionDesc: 'Ibikoresho bigezweho bya Leica & Trimble bipima neza kugeza kuri santimetero.',
  officialReports: 'Raporo zemewe n\'amakarita ya GeoJSON',
  officialReportsDesc: 'Ibyangombwa byemewe byasinywe n\'amakarita asobanutse yo gushyira mu mategeko.',
  fastDelivery: 'Gutanga raporo vuba mu masaha 24-48',
  fastDeliveryDesc: 'Abapima bari hafi mu Mujyi wa Kigali no mu ntara zose z\'u Rwanda.',
  sampleSurveysTitle: 'Urugero rw\'Ibibanza byapimwe n\'Imbibi',
  viewSampleReport: 'Reba raporo y\'urugero',
  trackSurveyTitle: 'Kurikirana aho ubusabe bwawe bugeze',
  trackSurveyPlaceholder: 'Injiza numero y\'ubusabe (Reference ID)...',
  trackBtn: 'Kurikirana',
  parcelDetails: 'Amakuru y\'ikibanza cyapimwe',
  upiNumber: 'Numero ya UPI',
  parcelArea: 'Ubuso bwashyizwe mu mibare',
  coordinates: 'Ibyerekezo (Lat, Lng)',
  surveySuccessMsg: 'Ubusabe bwawe bwo gupima bwakiriwe neza! Umukozi azakuvugisha vuba.',
  surveyLoginPrompt: 'Injira kugira ngo usabe gupimisha ubutaka bwawe cyangwa ukurikirane amakuru yawe.',
  roleAdmin: 'Umuyobozi Mukuru (Admin)',
  roleManager: 'Umugenzuzi (Manager)',
  roleAgent: "Umukozi w'Imitungo & Ipima (Agent)",
  roleClient: 'Umukiriya (Client)',
  overview: 'Incamake',
  analytics: 'Imibare & Icyegeranyo',
  activityFeed: 'Ibikorwa biheruka',
  actionRequired: 'Hakenewe igikorwa',
  moderationHub: 'Urutonde rwo kwemeza',
  pendingItems: 'Ibiri mu isuzuma',
  canApproveProperty: "Kwemeza imitangazo y'inzu/ubutaka",
  canApproveGis: 'Kwemeza & guha abakozi amakarita ya GIS',
  canApproveJobs: "Kwemeza amatangazo y'akazi",
  canApproveMarket: 'Kwemeza ibicuruzwa byo ku isoko',
  canApproveServices: 'Kwemeza abatanga serivisi',
  rejectionReason: 'Impamvu yo kwanga',
  enterRejectionReason: 'Andika impamvu itangazo ryanzwe...',
  confirmAction: 'Emeza igikorwa',
  resubmitListing: 'Kosora wongere wohereze',
  statusChangedSuccess: 'Imiterere yahinduwe neza',
  totalUsers: 'Abakoresha bose hamwe',
  totalListings: 'Amatangazo yose',
  activeListings: 'Amatangazo akora',
  pendingApprovals: 'Ategereje kwemezwa',
  assignedMissions: 'Imirimo nahawe',
  completedSurveys: 'Ibyapimwe byarangiye',
  filterAll: 'Byose',
  editUser: 'Hindura ukoresha',
  managePermissions: 'Genzura uburenganzira',
  grantPermission: 'Tanga uburenganzira',
  revokePermission: 'Kura uburenganzira',
  permissionSaved: 'Uburenganzira bwabitswe neza',
  postNewListing: 'Shyiraho itangazo rishya',
  myRecentActivity: 'Ibikorwa byanjye biheruka',
  quickActions: 'Ibikorwa byihuse',
  downloadReport: 'Kura raporo hano',
  viewApplicants: 'Reba abasabye',
  applicantsCount: 'Abasabye',
  applicationsSubmitted: 'Ubusabe bwoherejwe',
  jobApplicationsTitle: "Ubusabe bw'akazi",
  surveyProgress: 'Aho gupima bigeze',
  rejectionCommentLabel: "Ubutumwa bw'umugenzuzi",
  back: 'Subira',
  collapse: 'Gukuba',
  expand: 'Kwagura',
  noPreview: 'Nta shusho ihari',
  posted: 'Byashyizweho',
  closes: 'Birangira',
  viewOpportunity: 'Reba amahirwe',
  openOpportunities: 'Amahirwe afunguye',
  duhuzaOpportunities: 'Amahirwe ya Duhuza',
  findNextRole: 'Shaka akazi kawe gakurikira ku bakoresha bizewe mu Rwanda.',
  searchByLocation: 'Shakisha akarere cyangwa aho biherereye',
  liveSource: 'Inkomoko iri ku murongo',
  mifotraVacancies: 'Reba imyanya ya MIFOTRA',
  allOpportunities: 'Amahirwe yose',
  technology: 'Ikoranabuhanga',
  landAndGis: 'Ubutaka na GIS',
  operations: 'Imikorere',
  marketing: 'Kwamamaza',
  internships: 'Imyitozo y’akazi',
  verifiedEmployer: 'Umukoresha wemejwe wa Duhuza',
  aboutOpportunity: 'Ibyerekeye aya mahirwe',
  readyToApply: 'Witeguye gusaba?',
  submitApplication: 'Ohereza ubusabe bwawe kugira ngo busuzumwe n’umukoresha.',
  applyBy: 'Saba mbere ya',
  exploreEcosystem: 'Shakisha serivisi za Duhuza',
  fastSecureVerified: 'Byihuse, bifite umutekano kandi byemejwe mu Rwanda',
  manageAccounts: 'Genzura konti, imiterere n’uburenganzira bwihariye',
  searchUsers: 'Shakisha ukoresheje amazina, imeyili cyangwa telefone...',
  forgotPassword: 'Wibagiwe ijambobanga?',
  forgotPasswordSubtitle: 'Injiza imeyili cyangwa nimero ya telefone yawe kugira ngo wakire kode yo guhindura ijambobanga.',
  resetPassword: 'Hindura Ijambobanga',
  resetPasswordSubtitle: 'Shyiramo kode yo kwemeza hamwe n\'ijambobanga rishya rikomeye.',
  sendResetCode: 'Ohereza Kode yo Kwemeza',
  resetCode: 'Kode yo Kwemeza (Imibare 6)',
  enterResetCode: 'Injiza kode y\'imibare 6',
  codeSentNotice: 'Kode yo kwemeza yoherejwe kuri konti yawe. Izamara iminota 15.',
  newPassword: 'Ijambobanga Rishya',
  confirmPassword: 'Emeza Ijambobanga Rishya',
  passwordsDoNotMatch: 'Amagambo y\'ibanga ntabwo ahuye',
  passwordResetSuccess: 'Ijambobanga ryahinduwe neza! Urashobora kwinjira ubu.',
  passwordChangedSuccess: 'Ijambobanga ryawe ryahinduwe neza.',
  backToLogin: 'Subira Kwinjira',
  profile: 'Umwirondoro',
  myProfile: 'Umwirondoro Wanjye',
  profileOverview: 'Incamake y\'Umwirondoro',
  personalInfo: 'Amakuru Yiteganyirije',
  securitySettings: 'Umutekano n\'Ijambobanga',
  changePassword: 'Guhindura Ijambobanga',
  currentPassword: 'Ijambobanga Risanzwe',
  updateProfile: 'Guhindura Umwirondoro',
  profileUpdatedSuccess: 'Umwirondoro wavuguruwe neza.',
  memberSince: 'Yinjiye kuva',
  accountDetails: 'Amakuru ya Konti',
  sessionSecurity: 'Umutekano wa Sisitemu (Iminota 10)',
  sessionSecurityDesc: 'Konti yawe isohoka mu buryo bwikora nyuma y\'iminota 10 udakora ikintu na kimwe kugira ngo amakuru yawe arindwe.',
  inactivityTimeoutWarning: 'Uteganya gusohoka kubera kutagira icyo ukora mu minota 10.',
  sessionExpiredDueToInactivity: 'Igihe cyawe cyarangiye kubera kutagira icyo ukora mu minota 10. Ongera winjire.',
  stayActive: 'Komeza Kwinjira',
  viewProfile: 'Reba Umwirondoro',
};

const en: Translations = {
  appName: 'Duhuza',
  tagline: 'Property & rental platform',
  home: 'Home',
  listings: 'Listings',
  market: 'Market',
  services: 'Services',
  jobs: 'Jobs',
  gis: 'GIS & Surveys',
  gisNav: 'GIS & Surveys',
  login: 'Login',
  register: 'Register',
  logout: 'Logout',
  dashboard: 'Dashboard',
  search: 'Search',
  filter: 'Filter',
  category: 'Category',
  province: 'Province',
  district: 'District',
  sector: 'Sector',
  cell: 'Cell',
  village: 'Village',
  price: 'Price',
  type: 'Type',
  sale: 'Sale',
  rent: 'Rent',
  contactWhatsapp: 'Contact via WhatsApp',
  loading: 'Loading...',
  error: 'Error',
  noResults: 'No results found',
  viewDetails: 'View details',
  createListing: 'Create listing',
  myListings: 'My listings',
  submitForReview: 'Submit for review',
  pendingReview: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  draft: 'Draft',
  published: 'Published',
  approve: 'Approve',
  reject: 'Reject',
  comment: 'Comment',
  pendingQueue: 'Pending queue',
  createMarketItem: 'Post market item',
  myMarketItems: 'My market items',
  postJob: 'Post a job',
  myJobs: 'My jobs',
  apply: 'Apply',
  myApplications: 'My applications',
  gisRequest: 'Request survey',
  serviceProvider: 'My service profile',
  users: 'Users',
  createUser: 'Create user',
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  password: 'Password',
  save: 'Save',
  cancel: 'Cancel',
  description: 'Description',
  title: 'Title',
  location: 'Location',
  status: 'Status',
  actions: 'Actions',
  welcomeBack: 'Welcome back',
  browseProperties: 'Browse properties',
  heroSubtitle: 'Find homes, rentals, market items and jobs — all in one place',
  allCategories: 'All categories',
  house: 'House',
  land: 'Land',
  vehicle: 'Vehicle',
  motorcycle: 'Motorcycle',
  minPrice: 'Min price',
  maxPrice: 'Max price',
  language: 'Language',
  clientDashboard: 'Client dashboard',
  agentDashboard: 'Agent dashboard',
  managerDashboard: 'Manager dashboard',
  adminDashboard: 'Admin dashboard',
  assignedGis: 'Assigned surveys',
  registerAsProvider: 'Register as provider',
  salaryRange: 'Salary range',
  deadline: 'Deadline',
  purpose: 'Purpose',
  parcelLocation: 'Parcel location',
  assignAgent: 'Assign agent',
  agentId: 'Agent ID',
  markInProgress: 'Mark in progress',
  markCompleted: 'Mark completed',
  reportUrl: 'Report URL',
  mediaUrls: 'Photo URLs',
  ownerInfo: 'Owner info',
  internalNotes: 'Internal notes',
  attributes: 'Attributes',
  translations: 'Translations',
  alreadyHaveAccount: 'Already have an account?',
  noAccount: "Don't have an account?",
  identifier: 'Email or phone',
  role: 'Role',
  active: 'Active',
  suspended: 'Suspended',
  permissions: 'Permissions',
  errorLoadProperties: 'Unable to load properties',
  errorLoadMarket: 'Unable to load market items',
  errorLoadJobs: 'Unable to load jobs',
  errorLoadServices: 'Unable to load services',
  errorServerSubtitle: "We're having trouble connecting to our servers right now.",
  tryAgain: 'Try Again',
  allDistricts: 'All districts',
  allProvinces: 'All provinces',
  allSectors: 'All sectors',
  selectProvince: 'Select province',
  selectDistrict: 'Select district',
  selectSector: 'Select sector',
  selectCell: 'Select cell',
  selectVillage: 'Select village',
  allTypes: 'All types',
  budgetAny: 'Any budget',
  budgetUnder10M: 'Under 10M RWF',
  budget10to50M: '10M – 50M RWF',
  budget50to100M: '50M – 100M RWF',
  budgetOver100M: 'Over 100M RWF',
  locationPlaceholder: 'Search by location...',
  categoryElectronics: 'Electronics',
  categoryFurniture: 'Furniture',
  categoryProduce: 'Produce',
  servicePlumbing: 'Plumbing',
  serviceTransport: 'Transport',
  serviceTutoring: 'Tutoring',
  serviceTailoring: 'Tailoring',
  gisHeroTitle: 'GIS Mapping & Professional Land Surveying in Rwanda',
  gisHeroSubtitle: 'Certified cadastral boundary demarcation, topographical surveys, UPI parcel mapping, and RTK GNSS precision across Rwanda.',
  requestSurveyNow: 'Request a Land Survey',
  interactiveMap: 'Interactive Cadastral & Parcel Map',
  clickMapToPin: 'Click anywhere on the map to set your parcel coordinates',
  surveyPurpose: 'Survey Purpose / Type',
  boundaryDemarcation: 'Cadastral Boundary Demarcation / Verification',
  topographicalSurvey: 'Topographical & 3D Contour Survey',
  landSubdivision: 'Land Partitioning & Subdivision',
  titleTransferSurvey: 'Title Transfer & UPI Verification',
  constructionPermit: 'Construction Permit & Master Plan Alignment',
  agriculturalMapping: 'Agricultural & Large Estate Mapping',
  parcelSizeEst: 'Estimated Parcel Size (m² or hectares)',
  contactPhone: 'Contact Phone (WhatsApp enabled)',
  clientNotes: 'Additional Notes or UPI Number',
  calcEstimate: 'Instant Cost Estimator',
  estCost: 'Estimated Price',
  surveyFeaturesTitle: 'Why Choose Duhuza GIS & Survey Services?',
  certifiedSurveyors: 'Certified & Licensed Surveyors',
  certifiedSurveyorsDesc: 'Fully accredited by Rwanda Land Management and Use Authority (RLMUA) and INES-Ruhengeri/NESA certified.',
  highPrecision: 'Sub-Centimeter GNSS RTK Accuracy',
  highPrecisionDesc: 'Modern Trimble & Leica GNSS rovers for pinpoint cadastral boundary beacons and contour elevations.',
  officialReports: 'Official Cadastral Report & GeoJSON',
  officialReportsDesc: 'Receive official signed survey plans, elevation profiles, and digital GeoJSON boundaries for your land deed.',
  fastDelivery: 'Fast 24-48h Delivery',
  fastDeliveryDesc: 'Surveyors dispatched locally in Kigali, Eastern, Northern, Southern, and Western provinces.',
  sampleSurveysTitle: 'Sample Surveyed Parcels & Interactive Demarcations',
  viewSampleReport: 'Preview Sample Survey Report',
  trackSurveyTitle: 'Track Existing Survey Request',
  trackSurveyPlaceholder: 'Enter your Survey Reference ID...',
  trackBtn: 'Track Status',
  parcelDetails: 'Parcel Demarcation Details',
  upiNumber: 'UPI (Unique Parcel Identifier)',
  parcelArea: 'Calculated Area',
  coordinates: 'Coordinates (Lat, Lng)',
  surveySuccessMsg: 'Your land survey request has been received! Our licensed surveyor team will contact you shortly.',
  surveyLoginPrompt: 'Please login or register to submit a verified survey request or track your surveys.',
  roleAdmin: 'System Administrator (Admin)',
  roleManager: 'Operations & Moderation (Manager)',
  roleAgent: 'Licensed Agent & Surveyor (Agent)',
  roleClient: 'User / Customer (Client)',
  overview: 'Overview',
  analytics: 'Analytics & KPIs',
  activityFeed: 'Recent Activity',
  actionRequired: 'Action Required',
  moderationHub: 'Moderation Hub',
  pendingItems: 'Pending Items',
  canApproveProperty: 'Approve property & land listings',
  canApproveGis: 'Approve & assign GIS survey tasks',
  canApproveJobs: 'Approve job postings',
  canApproveMarket: 'Approve marketplace items',
  canApproveServices: 'Approve service provider profiles',
  rejectionReason: 'Rejection Reason',
  enterRejectionReason: 'Enter specific feedback for rejection...',
  confirmAction: 'Confirm Action',
  resubmitListing: 'Edit & Resubmit',
  statusChangedSuccess: 'Status updated successfully',
  totalUsers: 'Total Platform Users',
  totalListings: 'Total Listings',
  activeListings: 'Active Listings',
  pendingApprovals: 'Pending Approvals',
  assignedMissions: 'Assigned Missions',
  completedSurveys: 'Completed Surveys',
  filterAll: 'All',
  editUser: 'Edit User',
  managePermissions: 'Manage Privileges',
  grantPermission: 'Grant Permission',
  revokePermission: 'Revoke Permission',
  permissionSaved: 'Permissions saved successfully',
  postNewListing: 'Create New Listing',
  myRecentActivity: 'My Recent Activity',
  quickActions: 'Quick Actions',
  downloadReport: 'Download Report',
  viewApplicants: 'View Applicants',
  applicantsCount: 'Applicants',
  applicationsSubmitted: 'Applications Submitted',
  jobApplicationsTitle: 'Job Applications',
  surveyProgress: 'Survey Progress',
  rejectionCommentLabel: 'Manager Review Note',
  back: 'Back',
  collapse: 'Collapse',
  expand: 'Expand',
  noPreview: 'No preview available',
  posted: 'Posted',
  closes: 'Closes',
  viewOpportunity: 'View opportunity',
  openOpportunities: 'open opportunities',
  duhuzaOpportunities: 'Duhuza opportunities',
  findNextRole: 'Find your next role with trusted employers across Rwanda.',
  searchByLocation: 'Search by district or location',
  liveSource: 'Live source',
  mifotraVacancies: 'View MIFOTRA vacancies',
  allOpportunities: 'All opportunities',
  technology: 'Technology',
  landAndGis: 'Land and GIS',
  operations: 'Operations',
  marketing: 'Marketing',
  internships: 'Internships',
  verifiedEmployer: 'Verified Duhuza employer',
  aboutOpportunity: 'About this opportunity',
  readyToApply: 'Ready to apply?',
  submitApplication: 'Submit your application for review by the employer.',
  applyBy: 'Apply by',
  exploreEcosystem: 'Explore Duhuza ecosystem',
  fastSecureVerified: 'Fast, secure and verified listings across Rwanda',
  manageAccounts: 'Manage accounts, status, and granular permissions',
  searchUsers: 'Search by name, email, or phone...',
  forgotPassword: 'Forgot Password?',
  forgotPasswordSubtitle: 'Enter your email or phone number to receive a 6-digit reset code.',
  resetPassword: 'Reset Password',
  resetPasswordSubtitle: 'Enter the verification code and set a strong new password.',
  sendResetCode: 'Send Verification Code',
  resetCode: '6-Digit Verification Code',
  enterResetCode: 'Enter 6-digit code',
  codeSentNotice: 'A verification code has been sent. It will expire in 15 minutes.',
  newPassword: 'New Password',
  confirmPassword: 'Confirm New Password',
  passwordsDoNotMatch: 'Passwords do not match',
  passwordResetSuccess: 'Password reset successfully! You can now log in.',
  passwordChangedSuccess: 'Your password has been changed successfully.',
  backToLogin: 'Back to Login',
  profile: 'Profile',
  myProfile: 'My Profile',
  profileOverview: 'Profile Overview',
  personalInfo: 'Personal Information',
  securitySettings: 'Security & Password',
  changePassword: 'Change Password',
  currentPassword: 'Current Password',
  updateProfile: 'Update Profile',
  profileUpdatedSuccess: 'Profile updated successfully.',
  memberSince: 'Member since',
  accountDetails: 'Account Details',
  sessionSecurity: 'Session Security (10-Min Auto-Logout)',
  sessionSecurityDesc: 'For your security, sessions automatically log out after 10 minutes of inactivity to protect sensitive platform operations.',
  inactivityTimeoutWarning: 'You will be logged out in 60 seconds due to inactivity.',
  sessionExpiredDueToInactivity: 'Your session has expired after 10 minutes of inactivity. Please log in again.',
  stayActive: 'Stay Logged In',
  viewProfile: 'View Profile',
};

const sw: Translations = {
  appName: 'Duhuza',
  tagline: 'Jukwaa la mali na kodi',
  home: 'Nyumbani',
  listings: 'Orodha',
  market: 'Soko',
  services: 'Huduma',
  jobs: 'Kazi',
  gis: 'GIS na Upimaji',
  gisNav: 'GIS na Upimaji',
  login: 'Ingia',
  register: 'Jisajili',
  logout: 'Toka',
  dashboard: 'Dashibodi',
  search: 'Tafuta',
  filter: 'Chuja',
  category: 'Kategoria',
  province: 'Intara',
  district: 'Wilaya',
  sector: 'Sehemu',
  cell: 'Kijiji',
  village: 'Kijiji',
  price: 'Bei',
  type: 'Aina',
  sale: 'Uuzaji',
  rent: 'Kodi',
  contactWhatsapp: 'Wasiliana kupitia WhatsApp',
  loading: 'Inapakia...',
  error: 'Hitilafu',
  noResults: 'Hakuna matokeo',
  viewDetails: 'Angalia maelezo',
  createListing: 'Unda tangazo',
  myListings: 'Matangazo yangu',
  submitForReview: 'Wasilisha kwa ukaguzi',
  pendingReview: 'Inasubiri ukaguzi',
  approved: 'Imekubaliwa',
  rejected: 'Imekataliwa',
  draft: 'Rasimu',
  published: 'Imechapishwa',
  approve: 'Kubali',
  reject: 'Kataa',
  comment: 'Maoni',
  pendingQueue: 'Foleni inayosubiri',
  createMarketItem: 'Chapisha bidhaa',
  myMarketItems: 'Bidhaa zangu',
  postJob: 'Chapisha kazi',
  myJobs: 'Kazi zangu',
  apply: 'Omba',
  myApplications: 'Maombi yangu',
  gisRequest: 'Omba ramani',
  serviceProvider: 'Wasifu wangu wa huduma',
  users: 'Watumiaji',
  createUser: 'Unda mtumiaji',
  name: 'Jina',
  email: 'Barua pepe',
  phone: 'Simu',
  password: 'Nywila',
  save: 'Hifadhi',
  cancel: 'Ghairi',
  description: 'Maelezo',
  title: 'Kichwa',
  location: 'Mahali',
  status: 'Hali',
  actions: 'Vitendo',
  welcomeBack: 'Karibu tena',
  browseProperties: 'Vinjari mali',
  heroSubtitle: 'Pata nyumba, kodi, bidhaa na kazi — mahali pamoja',
  allCategories: 'Kategoria zote',
  house: 'Nyumba',
  land: 'Ardhi',
  vehicle: 'Gari',
  motorcycle: 'Pikipiki',
  minPrice: 'Bei ya chini',
  maxPrice: 'Bei ya juu',
  language: 'Lugha',
  clientDashboard: 'Dashibodi ya mteja',
  agentDashboard: 'Dashibodi ya wakala',
  managerDashboard: 'Dashibodi ya msimamizi',
  adminDashboard: 'Dashibodi ya admin',
  assignedGis: 'Uchunguzi uliopangwa',
  registerAsProvider: 'Jisajili kama mtoa huduma',
  salaryRange: 'Mshahara',
  deadline: 'Mwisho',
  purpose: 'Lengo',
  parcelLocation: 'Mahali pa kiwanja',
  assignAgent: 'Panga wakala',
  agentId: 'ID ya wakala',
  markInProgress: 'Weka inaendelea',
  markCompleted: 'Weka imekamilika',
  reportUrl: 'URL ya ripoti',
  mediaUrls: 'Picha (URL)',
  ownerInfo: 'Taarifa za mmiliki',
  internalNotes: 'Maelezo ya ndani',
  attributes: 'Sifa',
  translations: 'Tafsiri',
  alreadyHaveAccount: 'Tayari una akaunti?',
  noAccount: 'Huna akaunti?',
  identifier: 'Barua pepe au simu',
  role: 'Jukumu',
  active: 'Hai',
  suspended: 'Imesimamishwa',
  permissions: 'Ruhusa',
  errorLoadProperties: 'Imeshindwa kupakia mali',
  errorLoadMarket: 'Imeshindwa kupakia bidhaa za soko',
  errorLoadJobs: 'Imeshindwa kupakia kazi',
  errorLoadServices: 'Imeshindwa kupakia huduma',
  errorServerSubtitle: 'Tuna shida ya kuunganisha na seva zetu sasa hivi.',
  tryAgain: 'Jaribu Tena',
  allDistricts: 'Wilaya zote',
  allProvinces: 'Mikoa yote',
  allSectors: 'Sehemu zote',
  selectProvince: 'Chagua mkoa',
  selectDistrict: 'Chagua wilaya',
  selectSector: 'Chagua sehemu',
  selectCell: 'Chagua kijiji',
  selectVillage: 'Chagua kijiji',
  allTypes: 'Aina zote',
  budgetAny: 'Bajeti yoyote',
  budgetUnder10M: 'Chini ya 10M RWF',
  budget10to50M: '10M – 50M RWF',
  budget50to100M: '50M – 100M RWF',
  budgetOver100M: 'Zaidi ya 100M RWF',
  locationPlaceholder: 'Tafuta mahali...',
  categoryElectronics: 'Elektroniki',
  categoryFurniture: 'Samani',
  categoryProduce: 'Mazao',
  servicePlumbing: 'Mifumo ya maji',
  serviceTransport: 'Usafiri',
  serviceTutoring: 'Ufundishaji',
  serviceTailoring: 'Ushonaji',
  gisHeroTitle: 'Huduma za Ramani ya GIS na Upimaji wa Ardhi nchini Rwanda',
  gisHeroSubtitle: 'Upimaji wa mipaka iliyoidhinishwa kisheria, ramani za UPI, na usahihi wa RTK GNSS kote Rwanda.',
  requestSurveyNow: 'Omba Upimaji wa Kiwanja',
  interactiveMap: 'Ramani Halisi ya Viwanja na UPI',
  clickMapToPin: 'Bofya popote kwenye ramani ili kuweka viwianishi vya kiwanja chako',
  surveyPurpose: 'Aina ya Upimaji',
  boundaryDemarcation: 'Kupima na kuthibitisha mipaka ya kiwanja (UPI)',
  topographicalSurvey: 'Upimaji wa muundo wa ardhi (Topografia 3D)',
  landSubdivision: 'Kugawa kiwanja katika sehemu (Subdivision)',
  titleTransferSurvey: 'Upimaji wa uhamisho wa hati ya milki',
  constructionPermit: 'Upimaji wa kupata kibali cha ujenzi',
  agriculturalMapping: 'Upimaji wa mashamba makubwa ya kilimo',
  parcelSizeEst: 'Ukubwa wa kiwanja (m² au hekta)',
  contactPhone: 'Nambari ya Simu (WhatsApp)',
  clientNotes: 'Maelezo ya ziada au nambari ya UPI',
  calcEstimate: 'Kikokotoo cha Makadirio ya Bei',
  estCost: 'Bei Iliyokadiriwa',
  surveyFeaturesTitle: 'Kwa nini uchague huduma za GIS za Duhuza?',
  certifiedSurveyors: 'Wapimaji Wenye Leseni na Walioidhinishwa',
  certifiedSurveyorsDesc: 'Walioidhinishwa na Mamlaka ya Ardhi ya Rwanda (RLMUA) na vyama vya wapimaji.',
  highPrecision: 'Usahihi wa Hali ya Juu wa GNSS RTK',
  highPrecisionDesc: 'Vifaa vya kisasa vya Leica na Trimble vinavyopima kwa usahihi wa sentimita.',
  officialReports: 'Ripoti Rasmi na Ramani za GeoJSON',
  officialReportsDesc: 'Pata hati zilizosainiwa rasmi na faili za kidijitali za GeoJSON za kiwanja chako.',
  fastDelivery: 'Utoaji wa Haraka wa Saa 24-48',
  fastDeliveryDesc: 'Wapimaji waliopo tayari Kigali na mikoa yote ya Rwanda.',
  sampleSurveysTitle: 'Mifano ya Viwanja Vilivyopimwa',
  viewSampleReport: 'Tazama Ripoti ya Mfano',
  trackSurveyTitle: 'Fuatilia Ombi Lako la Upimaji',
  trackSurveyPlaceholder: 'Weka nambari ya kumbukumbu (Reference ID)...',
  trackBtn: 'Fuatilia',
  parcelDetails: 'Maelezo ya Kiwanja Kilichopimwa',
  upiNumber: 'Nambari ya UPI',
  parcelArea: 'Eneo Lililopimwa',
  coordinates: 'Viwianishi (Lat, Lng)',
  surveySuccessMsg: 'Ombi lako la upimaji limepokelewa! Timu yetu ya wapimaji itawasiliana nawe hivi karibuni.',
  surveyLoginPrompt: 'Tafadhali ingia au jisajili ili kuwasilisha ombi la upimaji au kufuatilia ripoti zako.',
  roleAdmin: 'Msimamizi Mkuu (Admin)',
  roleManager: 'Msimamizi wa Uendeshaji (Manager)',
  roleAgent: 'Wakala & Mpimaji Ardhi (Agent)',
  roleClient: 'Mteja / Mtumiaji (Client)',
  overview: 'Muhtasari',
  analytics: 'Takwimu & KPIs',
  activityFeed: 'Shughuli za Hivi Karibuni',
  actionRequired: 'Hatua Inahitajika',
  moderationHub: 'Kituo cha Uhakiki',
  pendingItems: 'Vitu Vinavyosubiri',
  canApproveProperty: 'Kuidhinisha matangazo ya mali/ardhi',
  canApproveGis: 'Kuidhinisha & kupanga uchunguzi wa GIS',
  canApproveJobs: 'Kuidhinisha matangazo ya kazi',
  canApproveMarket: 'Kuidhinisha bidhaa za sokoni',
  canApproveServices: 'Kuidhinisha watoa huduma',
  rejectionReason: 'Sababu ya Kukataa',
  enterRejectionReason: 'Weka maelezo ya sababu ya kukataliwa...',
  confirmAction: 'Thibitisha Hatua',
  resubmitListing: 'Hariri & Wasilisha Tena',
  statusChangedSuccess: 'Hali imesasishwa kwa mafanikio',
  totalUsers: 'Watumiaji Wote',
  totalListings: 'Matangazo Yote',
  activeListings: 'Matangazo Yanayotumika',
  pendingApprovals: 'Yanayosubiri Idhini',
  assignedMissions: 'Majukumu Niliyopewa',
  completedSurveys: 'Upimaji Uliokamilika',
  filterAll: 'Yote',
  editUser: 'Hariri Mtumiaji',
  managePermissions: 'Simamia Ruhusa',
  grantPermission: 'Toa Ruhusa',
  revokePermission: 'Futa Ruhusa',
  permissionSaved: 'Ruhusa zimehifadhiwa',
  postNewListing: 'Unda Tangazo Jipya',
  myRecentActivity: 'Shughuli Zangu za Hivi Karibuni',
  quickActions: 'Vitendo vya Haraka',
  downloadReport: 'Pakua Ripoti',
  viewApplicants: 'Tazama Waombaji',
  applicantsCount: 'Waombaji',
  applicationsSubmitted: 'Maombi Yaliyowasilishwa',
  jobApplicationsTitle: 'Maombi ya Kazi',
  surveyProgress: 'Maendeleo ya Upimaji',
  rejectionCommentLabel: 'Ujumbe wa Mhakiki',
  back: 'Rudi',
  collapse: 'Kunja',
  expand: 'Panua',
  noPreview: 'Hakuna hakikisho',
  posted: 'Iliwekwa',
  closes: 'Inafungwa',
  viewOpportunity: 'Tazama nafasi',
  openOpportunities: 'nafasi zilizo wazi',
  duhuzaOpportunities: 'Nafasi za Duhuza',
  findNextRole: 'Pata kazi yako inayofuata kwa waajiri wanaoaminika kote Rwanda.',
  searchByLocation: 'Tafuta kwa wilaya au mahali',
  liveSource: 'Chanzo cha moja kwa moja',
  mifotraVacancies: 'Tazama nafasi za MIFOTRA',
  allOpportunities: 'Nafasi zote',
  technology: 'Teknolojia',
  landAndGis: 'Ardhi na GIS',
  operations: 'Uendeshaji',
  marketing: 'Masoko',
  internships: 'Mafunzo ya kazi',
  verifiedEmployer: 'Mwajiri wa Duhuza aliyethibitishwa',
  aboutOpportunity: 'Kuhusu nafasi hii',
  readyToApply: 'Uko tayari kutuma ombi?',
  submitApplication: 'Tuma ombi lako likaguliwe na mwajiri.',
  applyBy: 'Tuma kabla ya',
  exploreEcosystem: 'Chunguza mfumo wa Duhuza',
  fastSecureVerified: 'Orodha za haraka, salama na zilizothibitishwa kote Rwanda',
  manageAccounts: 'Simamia akaunti, hali na ruhusa maalum',
  searchUsers: 'Tafuta kwa jina, barua pepe au simu...',
  forgotPassword: 'Umesahau Nenosiri?',
  forgotPasswordSubtitle: 'Weka barua pepe au nambari yako ya simu kupokea nambari ya uthibitishaji.',
  resetPassword: 'Weka Upya Nenosiri',
  resetPasswordSubtitle: 'Weka nambari ya uthibitishaji na uchague nenosiri jipya.',
  sendResetCode: 'Tuma Nambari ya Uthibitishaji',
  resetCode: 'Nambari ya Uthibitishaji ya tarakimu 6',
  enterResetCode: 'Weka tarakimu 6',
  codeSentNotice: 'Nambari ya uthibitishaji imetumwa. Itaisha baada ya dakika 15.',
  newPassword: 'Nenosiri Jipya',
  confirmPassword: 'Thibitisha Nenosiri Jipya',
  passwordsDoNotMatch: 'Manenosiri hayalingani',
  passwordResetSuccess: 'Nenosiri limewekwa upya! Unaweza kuingia sasa.',
  passwordChangedSuccess: 'Nenosiri lako limebadilishwa kwa mafanikio.',
  backToLogin: 'Rudi Kwenye Kuingia',
  profile: 'Wasifu',
  myProfile: 'Wasifu Wangu',
  profileOverview: 'Muhtasari wa Wasifu',
  personalInfo: 'Taarifa Binafsi',
  securitySettings: 'Usalama na Nenosiri',
  changePassword: 'Badilisha Nenosiri',
  currentPassword: 'Nenosiri la Sasa',
  updateProfile: 'Sasisha Wasifu',
  profileUpdatedSuccess: 'Wasifu umesasishwa kwa mafanikio.',
  memberSince: 'Mwanachama tangu',
  accountDetails: 'Maelezo ya Akaunti',
  sessionSecurity: 'Usalama wa Kipindi (Kutoka Baada ya Dakika 10)',
  sessionSecurityDesc: 'Kwa usalama wako, mfumo unakutoa kiotomatiki baada ya dakika 10 za kutotumika.',
  inactivityTimeoutWarning: 'Utatolewa baada ya sekunde 60 kwa kutofanya shughuli yoyote.',
  sessionExpiredDueToInactivity: 'Kipindi chako kimeisha baada ya dakika 10 za kutotumika. Tafadhali ingia tena.',
  stayActive: 'Baki Ndani',
  viewProfile: 'Tazama Wasifu',
};

export const translations: Record<LanguageCode, Translations> = { RW: rw, EN: en, SW: sw };

export function t(lang: LanguageCode, key: TranslationKey): string {
  return translations[lang][key] ?? translations.EN[key] ?? key;
}

export const languageLabels: Record<LanguageCode, string> = {
  RW: 'Kinyarwanda',
  EN: 'English',
  SW: 'Kiswahili',
};
