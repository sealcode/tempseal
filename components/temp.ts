const Activity = {
	id: "",
	title: "",
	body: "",
	json: {}
};

type Activity = typeof Activity;

let a: Activity;

const headers: Array<Object> = Object.keys(Activity).map(key => {
	return { text: key, value: key };
});
