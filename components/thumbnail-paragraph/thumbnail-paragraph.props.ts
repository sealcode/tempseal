import { PropsDescription } from "./../../component";

export const Props: PropsDescription = {
	image_path: { control: "text", label: "Image" },
	img_side: {
		control: "dropdown",
		label: "Image on:",
		control_options: { values: ["left", "right"] }
	},
	headline: { control: "text", label: "Hheadline" },
	title: { control: "text", label: "Title" },
	description: { control: "markdown", label: "Description" },
	alt_text: { control: "text", label: "Image alt text" },
	sticky: {
		control: "dropdown",
		label: "Layout",
		control_options: { values: ["sticky", "float"] }
	}
};
