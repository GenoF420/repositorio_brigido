
const weatherAPIKey = "f30ef6a1df9c4507bfa182612230805"; // esto es un problema de seguridad.

const baseAPI = "https://api.weatherapi.com/v1/forecast.json?key=" + weatherAPIKey;
const commentsAPI = "https://dummyjson.com/comments";


const CityNameInput = document.getElementById("city_text_input");

const CityName = document.getElementById("city_name");
const CurrentHour = document.getElementById("city_current_hour");
const CurrentDegrees = document.getElementById("city_current_degrees");
const CurrentWind = document.getElementById("city_current_wind");
const CurrentHumidity = document.getElementById("city_current_humidity");
const CitySunset = document.getElementById("city_sunset_hour");
const CurrentWeather = document.getElementById("city_current_weather");
const CurrentWeatherImage = document.getElementById("city_current_weather_image");
const SearchForm = document.getElementById("search_form");
const RegistrationForm = document.getElementById("registration_form");
const LoginForm = document.getElementById("login_form");
const CommentsSection = document.getElementById("comments_section");


const bcrypt = dcodeIO.bcrypt;

let notyf = new Notyf();

window.addEventListener("load", (event) => {
    if (document.URL.indexOf("index.html") >= 0) {
        SearchForm.addEventListener("submit", e => {
            e.preventDefault();
            ChangeCity();
        })
        ChangeCity();
    }
    if (document.URL.indexOf("register.html") >= 0) {
        RegistrationForm.addEventListener("submit", e => {
            e.preventDefault();
            SendRegister(new FormData(e.target));
        })
    }
    if (document.URL.indexOf("login.html") >= 0) {
        LoginForm.addEventListener("submit", e => {
            e.preventDefault();
            SendLogin(new FormData(e.target));
        })
    }
})

function GetDataForCity(input) {
    fetch(baseAPI + "&q=" + input + "&days=1&aqi=yes&alerts=yes")
        .then(response => response.json())
        .then(UpdateValues)
}

function GetCommentsForCity(input) {
    fetch(commentsAPI)
    .then(response => response.json())
    .then(UpdateComments)
}

function UpdateValues(city) {
    CityName.innerHTML = city.location.name + ", " + city.location.country;
    CurrentHour.innerHTML = city.location.localtime;
    CurrentDegrees.innerHTML = city.current.temp_c + " °C";
    CurrentWind.innerText = city.current.wind_kph + " km/h";
    CurrentHumidity.innerText = city.current.humidity + "%";
    CurrentWeather.innerText = city.current.condition.text;
    CitySunset.innerText = city.forecast.forecastday[0].astro.sunset
    CurrentWeatherImage.src = city.current.condition.icon;
}

function UpdateComments(data) {
    CommentsSection.innerHTML = ""; // Limpiamos los comentarios
    data.comments.forEach(element => {
        CommentsSection.innerHTML += CommentDiv(element)
        console.log(element)
    });
}

function ChangeCity() {
    GetDataForCity(CityNameInput.value);
    GetCommentsForCity(CityNameInput.value);
}

function ComprobarRUT(rut) {
    // Despejar Puntos
    var valor = rut.value.replace('.','');
    // Despejar Guión
    valor = valor.replace('-','');
    
    // Aislar Cuerpo y Dígito Verificador
    cuerpo = valor.slice(0,-1);
    dv = valor.slice(-1).toUpperCase();
    
    // Formatear RUN
    rut.value = cuerpo + '-'+ dv
    
    // Si no cumple con el mínimo ej. (n.nnn.nnn)
    if(cuerpo.length < 7) { rut.setCustomValidity("RUT Incompleto"); return false;}
    
    // Calcular Dígito Verificador
    suma = 0;
    multiplo = 2;
    
    // Para cada dígito del Cuerpo
    for(i=1;i<=cuerpo.length;i++) {
    
        // Obtener su Producto con el Múltiplo Correspondiente
        index = multiplo * valor.charAt(cuerpo.length - i);
        
        // Sumar al Contador General
        suma = suma + index;
        
        // Consolidar Múltiplo dentro del rango [2,7]
        if(multiplo < 7) { multiplo = multiplo + 1; } else { multiplo = 2; }
  
    }
    
    // Calcular Dígito Verificador en base al Módulo 11
    dvEsperado = 11 - (suma % 11);
    
    // Casos Especiales (0 y K)
    dv = (dv == 'K')?10:dv;
    dv = (dv == 0)?11:dv;
    
    // Validar que el Cuerpo coincide con su Dígito Verificador
    if(dvEsperado != dv) { rut.setCustomValidity("RUT Inválido"); return false; }
    
    // Si todo sale bien, eliminar errores (decretar que es válido)
    rut.setCustomValidity('');
    return true;
}

function CommentDiv(data) {
    return '<div class="card">' +
    '<div class="card-header">'+ data.user.username +'</div>'+
    '<div class="card-body">'+
      '<blockquote class="blockquote mb-0">'+
        '<p>' + data.body +'</p>'+
      '</blockquote>'+
    '</div>'+
  '</div>'+
  '<hr>'
}

function SendRegister(form) {
    var obj = {};
    form.forEach((value, key) => {
        if(!Reflect.has(obj, key)){
            obj[key] = value;
            return;
        }
        if(!Array.isArray(obj[key])){
            obj[key] = [obj[key]];    
        }
        obj[key].push(value);
    });

    if (obj.password_input != obj.repassword_input) {
        notyf.error("Contraseñas no son iguales!");
        return
    }

    obj.password_input = bcrypt.hashSync(obj.password_input, 8);
    obj.repassword_input = bcrypt.hashSync(obj.repassword_input, 8);

    notyf.success("Registro enviado :D");
    notyf.success("Clave encriptada = " + obj.password_input);
    //deberiamos mandar aqui el json.
}

function SendLogin(form) {
    var obj = {};
    form.forEach((value, key) => {
        if(!Reflect.has(obj, key)){
            obj[key] = value;
            return;
        }
        if(!Array.isArray(obj[key])){
            obj[key] = [obj[key]];    
        }
        obj[key].push(value);
    });

    obj.password_input = bcrypt.hashSync(obj.password_input, 8);

    notyf.success("Login enviado :D");
    notyf.success("Clave encriptada = " + obj.password_input);

    //deberiamos mandar aqui el json.
}