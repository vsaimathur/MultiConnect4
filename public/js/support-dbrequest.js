const form = document.querySelector("#support-form-main");
const successCaption = document.querySelector("#success-caption");

form.addEventListener("submit", (event) => {
	event.preventDefault();
	db.collection("support-requests").add({
		email : form.email.value,
		name : form.name.value,
		message : form.message.value
	});
	form.email.value = "";
	form.name.value = "";
	form.message.value = "";
	successCaption.style.display = "initial";
});

