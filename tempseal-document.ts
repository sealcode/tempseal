interface ISgement {
	component_name: string;
	props: any;
}

export type TempsealDocument = { language: string; segments: Array<ISgement> };
