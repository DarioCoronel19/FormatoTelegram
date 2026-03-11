
import { radioBases } from "./radioBases.js"
import { rbDependencias } from "./rbDependencias.js"

const plaza = document.getElementById("plaza")
const radiobase = document.getElementById("radiobase")
const rbAfectadas = document.getElementById("rbAfectadas")
const tiempo = document.getElementById("tiempoAfectacion")
const tipoAfectacion = document.getElementById("tipoAfectacion")
const tipoAfectacionCell = document.querySelector(".tipoAfectacionCell")


/* cargar radiobases por plaza */

plaza.addEventListener("change",()=>{

const p = plaza.value

radiobase.innerHTML=""

if(radioBases[p]){

radioBases[p].forEach(rb=>{

let option=document.createElement("option")

option.value=rb
option.textContent=rb

radiobase.appendChild(option)

})

}

rbAfectadas.value=""

})


/* mostrar dependencias */

radiobase.addEventListener("change",()=>{

const rb = radiobase.value

if(rbDependencias[rb]){

rbAfectadas.value = rbDependencias[rb].join(", ")

}else{

rbAfectadas.value=""

}

})


/* tiempo afectacion - red for any text, yellow for "pendiente" */

tiempo.addEventListener("input",()=>{

tiempo.classList.remove("pendiente")

const value = tiempo.value.toLowerCase().trim()

if(value === "pendiente"){

tiempo.classList.add("pendiente")

}

})


/* textarea auto tamaño - solo para AVANCE y SOLUCION */

document.querySelectorAll("#avance, #solucion").forEach(t=>{

t.addEventListener("input",()=>{

// Reset height to auto first
t.style.height = "auto"

// If there's content, expand to fit; otherwise reset to default 40px
if (t.value.trim() === "") {
    t.style.height = "40px"
} else {
    t.style.height = t.scrollHeight + "px"
}

})

})


/* dark mode toggle - uses data-theme attribute */

window.toggleDark=function(){

const html = document.documentElement

if(html.getAttribute("data-theme") === "dark"){

html.removeAttribute("data-theme")

}else{

html.setAttribute("data-theme", "dark")

}

}


/* Tipo de Afectación - Cambiar color según selección */

tipoAfectacion.addEventListener("change", () => {
    // Remover todas las clases primero
    tipoAfectacionCell.classList.remove("total", "parcial", "sinAfectacion")
    
    const value = tipoAfectacion.value
    
    // Si es "Seleccionar" (vacío), no aplicar ningún color
    if (value === "" || value === "Seleccionar") {
        return
    }
    
    if (value.includes("Total")) {
        tipoAfectacionCell.classList.add("total")
    } else if (value.includes("Parcial")) {
        tipoAfectacionCell.classList.add("parcial")
    } else if (value.includes("Sin afectación")) {
        tipoAfectacionCell.classList.add("sinAfectacion")
    }
})

