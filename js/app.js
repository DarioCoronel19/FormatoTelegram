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

const datalist = document.getElementById("radiobaseDatalist")
datalist.innerHTML = '<option value="">Selecciona o escribe RB...</option>'

if (radioBases[p]) {

radioBases[p].forEach(rb => {

const option = document.createElement("option")
option.value = `${rb}|${p}`
option.textContent = rb
datalist.appendChild(option)

})

document.getElementById("radiobase").value = ""
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

/* mostrar RB afectadas y autocomplete - MEJORADO */

const datalist = document.getElementById("radiobaseDatalist")
const rbInput = document.getElementById("radiobase")

// Debounce function
function debounce(func, delay) {
    let timeoutId
    return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
}

// Live filter SIMPLIFICADO - sin debounce temporalmente para debug
let primeraCoincidencia = null

rbInput.addEventListener("input", () => {

const texto = rbInput.value.toLowerCase().trim()

const datalist = document.getElementById("radiobaseDatalist")
datalist.innerHTML = ""

if (texto.length < 1) return

let resultados = []

/* =========================
BUSQUEDA POR PLAZA
========================= */

if (plaza.value && radioBases[plaza.value]) {

radioBases[plaza.value].forEach(rb => {

if (rb.toLowerCase().includes(texto)) {

resultados.push({
rb: rb,
plaza: plaza.value
})

}

})

}

/* =========================
BUSQUEDA GLOBAL
========================= */

else{

for(const pl in radioBases){

radioBases[pl].forEach(rb=>{

if(rb.toLowerCase().includes(texto)){

resultados.push({
rb: rb,
plaza: pl
})

}

})

}

}

/* limitar resultados */

resultados = resultados.slice(0,15)

/* guardar primera coincidencia */

primeraCoincidencia = resultados[0] || null

/* mostrar resultados en datalist Y listado visible */

resultados.forEach(item=>{

const option = document.createElement("option")

option.value = `${item.rb}|${item.plaza}`

option.textContent = `${item.rb} - ${item.plaza}`

datalist.appendChild(option)

})

/* Listado visible - NUEVO */

const rbListado = document.getElementById("rbListado")

if (rbListado) {

  rbListado.innerHTML = ""

  resultados.forEach(item => {

    const div = document.createElement("div")

    div.className = "rb-listado-item"

    div.dataset.rb = item.rb

    div.dataset.plaza = item.plaza

    div.innerHTML = `📡 ${item.rb} <span style="opacity:0.7;font-size:12px;">- ${item.plaza}</span>`

    div.addEventListener("click", () => {

      rbInput.value = `${item.rb}|${item.plaza}`

      rbInput.dispatchEvent(new Event("change"))

      rbListado.innerHTML = "" // Ocultar lista

    })

    rbListado.appendChild(div)

  })

}

})

rbInput.addEventListener("keydown",(e)=>{

if(e.key === "Enter" && primeraCoincidencia){

e.preventDefault()

rbInput.value = `${primeraCoincidencia.rb}|${primeraCoincidencia.plaza}`

rbInput.dispatchEvent(new Event("change"))

}

})

// Clear on backspace to empty
rbInput.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && rbInput.value === "") {
        rbAfectadas.value = ""
    }
})

// Handle selection - MEJORADO
rbInput.addEventListener("change", () => {

const fullValue = rbInput.value

const parts = fullValue.split("|")

const rbSeleccionada = parts[0]?.trim()

const plazaSeleccionada = parts[1]?.trim()

if(!rbSeleccionada) return

/* auto completar plaza */

if(plazaSeleccionada){

plaza.value = plazaSeleccionada

plaza.dispatchEvent(new Event("change"))

}

/* calcular dependencias */

const dependencias = obtenerDependencias(rbSeleccionada)

if (dependencias.includes("Incidencia Masiva")) {

rbAfectadas.value = "🔴 INCIDENCIA MASIVA"

return

}

if (dependencias.length === 0) {

rbAfectadas.value = "✅ Sin RBs afectadas"

}else{

const unicas = [...new Set(dependencias)].sort()

rbAfectadas.value = unicas.join(", ")

}

/* colores por cantidad */

const tdAfectadas = rbAfectadas.parentElement

tdAfectadas.classList.remove("afectacion-media","afectacion-grande")

const cantidad = rbAfectadas.value.split(",").filter(Boolean).length

if(cantidad >=4 && cantidad <=10){

tdAfectadas.classList.add("afectacion-media")

}else if(cantidad >10){

tdAfectadas.classList.add("afectacion-grande")

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

/* ============================
BUSCADOR GLOBAL DE RADIOBASES
============================ */










