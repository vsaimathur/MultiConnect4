var toggleThemeButton = document.getElementById("toggle-theme-btn");
var navbar = document.getElementById("top-navbar");
var footer = document.getElementsByClassName("footer")[0];
var supportText1 = document.querySelector("#support-text1");
var supportText2 = document.querySelector("#support-text2");
var supportText3 = document.querySelector("#support-text3");

//Theme Setting Function

function setTheme(theme)
{

	if(theme === "Light")
	{
		//Navbar Theme
		navbar.removeAttribute("class");
		navbar.setAttribute("class","navbar navbar-expand-lg navbar-light bg-primary");
		
		//Navbar Theme button
		toggleThemeButton.innerHTML = "Dark";
		toggleThemeButton.removeAttribute("class");
		toggleThemeButton.setAttribute("class","btn btn-dark");

		//background Theme
		document.body.style.background = "linear-gradient(to right, #ffa751, #ffe259)";

		//support text
		supportText1.removeAttribute("class");
		supportText1.setAttribute("class","text-dark");
		supportText2.removeAttribute("class");
		supportText2.setAttribute("class","text-dark");
		supportText3.removeAttribute("class");
		supportText3.setAttribute("class","text-dark");

		//footer Theme
		footer.removeAttribute("class");
		footer.setAttribute("class","footer bg-primary text-center text-white");
		
	}
	else
	{
		//Navbar Theme
		navbar.removeAttribute("class");
		navbar.setAttribute("class","navbar navbar-expand-lg navbar-dark bg-dark");

		//Navbar Theme button
		toggleThemeButton.innerHTML = "Light";
		toggleThemeButton.removeAttribute("class");
		toggleThemeButton.setAttribute("class","btn btn-light");

		//background Theme
		document.body.style.background = "black";

		//support text
		supportText1.removeAttribute("class");
		supportText1.setAttribute("class","text-light");
		supportText2.removeAttribute("class");
		supportText2.setAttribute("class","text-light");
		supportText3.removeAttribute("class");
		supportText3.setAttribute("class","text-light");

		//footer Theme
		footer.removeAttribute("class");
		footer.setAttribute("class","footer bg-dark text-center text-white")

	}
}

//cookie modifying methods...

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires;
}


function getCookie(cname)
{
	var cookieStringList = document.cookie;
	var cookieList = cookieStringList.split(";");
	for(let i = 0;i<cookieList.length;i++)
	{
		var cookieParts = cookieList[i].trim().split("=");
		var cnameCookie = cookieParts[0];
		if(cname === cnameCookie)
		{
			return cookieParts[1];
		}
	}
}

//DOM listeners

document.getElementById("toggle-theme-btn").addEventListener("click", (event) => {
	
	//checking text on button and changing text on button accordingly and also changing cookie accordingly.

	//checking the theme of page
	var themeCheck = getCookie("theme");
	
	//changing the theme of page
	setCookie("theme",themeCheck === "Dark" ? "Light" : "Dark",1)
	
	//setting theme of page according to change made.
	setTheme(getCookie("theme"));

});

window.onload = () => {
	setTheme(getCookie("theme"));
}


