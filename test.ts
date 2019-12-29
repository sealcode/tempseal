import { compile, write } from "./index";
import * as Tempseal from "./";

Tempseal.getComponents();

async function test() {
	const compile_result = await compile(Tempseal.getComponents(), [
		{
			component_name: "button",
			props: { hehe: "hihi", text: "I come from props" }
		},
		{
			component_name: "button",
			props: { hehe: "hihi", text: "I am another button" }
		}
	]);
	console.log(await write(compile_result, "", ""));
}

test();
