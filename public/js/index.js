var toggleThemeButton = document.getElementById("toggle-theme-btn");
var navbar = document.getElementById("top-navbar");
var animatedText = document.getElementById("animated-text");
var centerBox = document.getElementById("center-box");
var gameFrontImg = document.getElementById("game-center-content");
var footer = document.getElementsByClassName("footer")[0];
var frontTagline = document.getElementById("front-tagline");

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

		//making the size of animated text to large
		animatedText.style.fontSize = "large";

		//Adjusting alignment of center-box(content)
		// centerBox.remove();


		//Front/Cover MultiConnet4 image is present in light theme 
		//so creating every element from scratch and displaying it in html.
		var divParentImg = document.createElement("div");
		divParentImg.setAttribute("class", "front-image d-flex justify-content-center w-50");
		var frontImg = document.createElement("img");
		frontImg.setAttribute("src","./images/multi-connect4-front.jpg");
		frontImg.setAttribute("width","80%");
		frontImg.setAttribute("alt","sorry!, image was not loaded");
		divParentImg.appendChild(frontImg);
		gameFrontImg.insertBefore(divParentImg,gameFrontImg.firstChild);

		//Front Page TagLine Changing to Color to black/initial text color in light mode.
		frontTagline.removeAttribute("class");
		frontTagline.setAttribute("class","text-center");

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

		//animated text increasing size to xx-large in dark mode 
		animatedText.style.fontSize = "xx-large";

		//Adjusting alignment of center-box(content)


		//Front/Cover MultiConnet4 image is removed in dark theme 
		gameFrontImg.firstChild.remove();

		//Front Page TagLine Changing to Color to white/light in dark mode.
		frontTagline.removeAttribute("class");
		frontTagline.setAttribute("class","text-center text-light");

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
	setCookie("theme","Dark");
}


