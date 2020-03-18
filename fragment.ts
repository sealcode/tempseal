import { Context } from ".";

export default interface Fragment<ParamType = {}> {
	(context: Context, props: ParamType): Promise<string>;
}
