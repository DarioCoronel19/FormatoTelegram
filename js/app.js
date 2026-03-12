import { radioBases } from "./radioBases.js"
import { rbDependencias } from "./rbDependencias.js"

console.log("✅ Módulos cargados correctamente")
console.log("📡 radioBases:", radioBases ? "OK" : "FALTA")
console.log("🔗 rbDependencias:", rbDependencias ? "OK" : "FALTA")

const plaza = document.getElementById("plaza")
const radiobase = document.getElementById("radiobase")
const rbAfectadas = document.getElementById("rbAfectadas")
const tiempo = document.getElementById("tiempoAfectacion")
const tipoAfectacion = document.getElementById("tipoAfectacion")
const tipoAfectacionCell = document.querySelector(".tipoAfectacionCell")
const ticketNumber = document.getElementById("ticketNumber")

const horaInicio = document.querySelectorAll(".time-input")[0]
const horaFin = document.querySelectorAll(".time-input")[1]

/* verificar elementos */

if (!plaza || !radiobase || !rbAfectadas || !tiempo || !tipoAfectacion || !tipoAfectacionCell) {
    console.error("❌ ERROR: No se encontraron todos los elementos del DOM necesarios")
}

/* VALIDACION CAMPOS OBLIGATORIOS */

function validarCampos() {

    let valido = true

    const campos = [ticketNumber, plaza, tipoAfectacion]

    campos.forEach(campo => {

        if (!campo.value || campo.value === "Seleccionar") {

            campo.style.border = "2px solid red"
            valido = false

        } else {

            campo.style.border = ""

        }

    })

    return valido

}

/* cargar radiobases por plaza */

plaza.addEventListener("change", () => {

const p = plaza.value

radiobase.innerHTML = '<option value="">Seleccionar radiobase</option>'

if (radioBases[p]) {

radioBases[p].forEach(rb => {

let option = document.createElement("option")

option.value = rb
option.textContent = rb

radiobase.appendChild(option)

})

}

rbAfectadas.value = ""

})

/* obtener dependencias recursivas */

function obtenerDependencias(rb, visitadas = new Set()) {

    if (!rbDependencias[rb]) return []

    let resultado = []

    rbDependencias[rb].forEach(dep => {

        if (dep === "Incidencia Masiva") {
            resultado = ["Incidencia Masiva"]
            return
        }

        if (!visitadas.has(dep)) {

            visitadas.add(dep)

            resultado.push(dep)

            const subDeps = obtenerDependencias(dep, visitadas)

            resultado = resultado.concat(subDeps)

        }

    })

    return resultado

}

/* mostrar RB afectadas */

radiobase.addEventListener("change", () => {

    const rb = radiobase.value

    if (!rb) {
        rbAfectadas.value = ""
        return
    }

    const dependencias = obtenerDependencias(rb)

    if (dependencias.includes("Incidencia Masiva")) {

        rbAfectadas.value = "Incidencia Masiva"
        return

    }

    if (dependencias.length === 0) {

        rbAfectadas.value = "Sin RB afectadas"

    } else {

        const unicas = [...new Set(dependencias)]

        rbAfectadas.value = unicas.join(", ")

    }

})

/* CALCULO AUTOMATICO TIEMPO DE AFECTACION */

function calcularTiempoAfectacion() {

    const inicio = new Date(horaInicio.value)
    const fin = new Date(horaFin.value)

    if (!horaInicio.value || !horaFin.value) {
        tiempo.value = ""
        return
    }

    if (fin <= inicio) {
        tiempo.value = ""
        return
    }

    const diff = fin - inicio

    const horas = Math.floor(diff / (1000 * 60 * 60))
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    tiempo.value = `${horas}h ${minutos}m`

}

horaInicio.addEventListener("change", calcularTiempoAfectacion)
horaFin.addEventListener("change", calcularTiempoAfectacion)

/* tiempo afectacion - red for any text, yellow for "pendiente" */

tiempo.addEventListener("input",()=>{

tiempo.classList.remove("pendiente")

const value = tiempo.value.toLowerCase().trim()

if(value === "pendiente"){

tiempo.classList.add("pendiente")

}

})

/* textarea auto tamaño */

document.querySelectorAll("#avance, #solucion").forEach(t=>{

t.addEventListener("input",()=>{

t.style.height = "auto"

if (t.value.trim() === "") {
    t.style.height = "40px"
} else {
    t.style.height = t.scrollHeight + "px"
}

})

})

/* dark mode toggle */

window.toggleDark=function(){

const html = document.documentElement

if(html.getAttribute("data-theme") === "dark"){

html.removeAttribute("data-theme")

}else{

html.setAttribute("data-theme", "dark")

}

}

/* Tipo de Afectación - Cambiar color */

tipoAfectacion.addEventListener("change", () => {

    tipoAfectacionCell.classList.remove("total", "parcial", "sinAfectacion")
    
    const value = tipoAfectacion.value
    
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

/* VALIDAR AL SALIR DEL CAMPO */

[ticketNumber, plaza, tipoAfectacion].forEach(campo => {

campo.addEventListener("change", validarCampos)

})