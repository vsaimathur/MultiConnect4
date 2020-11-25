var toggleThemeButton = document.getElementById("toggle-theme-btn");
var navbar = document.getElementById("top-navbar");
var footer = document.getElementsByClassName("footer")[0];
var rulesList = document.getElementById("rules-list");

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

		//rules-list changing text color to default (black)
		rulesList.removeAttribute("class");
		rulesList.setAttribute("class","list-group");
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

		//rules-list changing text color to white 
		rulesList.removeAttribute("class");
		rulesList.setAttribute("class","list-group text-white");

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
	console.log(1);
	var themeCheck = getCookie("theme");
	
	//changing the theme of page
	setCookie("theme",themeCheck === "Dark" ? "Light" : "Dark",1)
	
	//setting theme of page according to change made.
	setTheme(getCookie("theme"));

});

window.onload = () => {
	setTheme(getCookie("theme"));
}


