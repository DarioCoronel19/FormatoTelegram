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

const rbListado = document.getElementById("rbListado")
const rbToggle = document.getElementById("rbToggle")

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

function resaltarCoincidencia(texto, busqueda){

const regex = new RegExp(`(${busqueda})`, "gi")

return texto.replace(regex,'<span class="rb-highlight">$1</span>')

}

function normalizarTexto(texto){
return texto
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
}

rbInput.addEventListener("input", () => {

const textoOriginal = rbInput.value.trim()
const texto = normalizarTexto(textoOriginal)

/* ocultar listado si está vacío */

if (texto.length < 1) {

rbListado.innerHTML = ""
rbListado.style.display = "none"
primeraCoincidencia = null
rbAfectadas.value = ""

return

}

let resultados = []

/* =========================
BUSQUEDA POR PLAZA
========================= */

if (plaza.value && radioBases[plaza.value]) {

radioBases[plaza.value].forEach(rb => {

const rbNormalizada = normalizarTexto(rb)

if (rbNormalizada.includes(texto)) {

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

const rbNormalizada = normalizarTexto(rb)

if(rbNormalizada.includes(texto)){

resultados.push({
rb: rb,
plaza: pl
})

}

})

}

}

/* limitar resultados */

resultados.sort((a,b)=>{

const aNormal = normalizarTexto(a.rb)
const bNormal = normalizarTexto(b.rb)

const aEmpieza = aNormal.startsWith(texto)
const bEmpieza = bNormal.startsWith(texto)

if(aEmpieza && !bEmpieza) return -1
if(!aEmpieza && bEmpieza) return 1

return aNormal.indexOf(texto) - bNormal.indexOf(texto)

})

resultados = resultados.slice(0,15)

if(resultados.length === 0){

rbListado.innerHTML = ""
rbListado.style.display = "none"
return

}

/* guardar primera coincidencia */

primeraCoincidencia = resultados[0] || null

/* Listado visible - NUEVO */

const rbListado = document.getElementById("rbListado")

if (rbListado) {

  rbListado.style.display = "block"

  rbListado.innerHTML = ""

  resultados.forEach(item => {

    const div = document.createElement("div")

    div.className = "rb-listado-item"

    div.dataset.rb = item.rb

    div.dataset.plaza = item.plaza

    const rbResaltada = resaltarCoincidencia(item.rb, textoOriginal)

    div.innerHTML = `${rbResaltada} <span class="rb-plaza">- ${item.plaza}</span>`  
    
    // "RB Celaya - Celaya" format

    div.addEventListener("click", () => {
      rbInput.value = item.rb  // Display ONLY RB name
      rbInput.dataset.selectedRb = item.rb
      rbInput.dataset.selectedPlaza = item.plaza
      rbInput.dispatchEvent(new Event("change"))
      rbListado.innerHTML = "" // Hide list
    })

    rbListado.appendChild(div)

  })

}

})

rbInput.addEventListener("keydown", (e) => {

if (e.key === "Enter" && primeraCoincidencia) {

e.preventDefault()

rbInput.value = primeraCoincidencia.rb
rbInput.dataset.selectedRb = primeraCoincidencia.rb
rbInput.dataset.selectedPlaza = primeraCoincidencia.plaza

rbListado.innerHTML = ""      // limpia resultados
rbListado.style.display="none" // oculta lista

}

})

// Clear on backspace to empty
rbInput.addEventListener("keydown",(e)=>{

if(e.key === "Backspace" && rbInput.value.length <= 1){

rbListado.innerHTML = ""
rbListado.style.display = "none"
rbAfectadas.value = ""
primeraCoincidencia = null

}

})

// Handle selection - MEJORADO
rbInput.addEventListener("change", () => {

  // FIXED: Use dataset for EXACT dependency lookup
  let valor = rbInput.dataset.selectedRb || rbInput.value.trim()

  const [rbSeleccionada, plazaDetectada] = valor.split("|")
  const plazaSeleccionada = rbInput.dataset.selectedPlaza || plazaDetectada

  console.log("RB seleccionada:", rbSeleccionada)
  console.log("Dependencias encontradas:", rbDependencias[rbSeleccionada])
  console.log("Valor input:", rbInput.value)
  console.log("Dataset RB:", rbInput.dataset.selectedRb)
  console.log("Dataset Plaza:", rbInput.dataset.selectedPlaza)
  console.log("RB usada para dependencias:", rbSeleccionada)
  console.log("Dependencias:", rbDependencias[rbSeleccionada])

  // console.log('🔍 DEBUG change:', {rbSeleccionada, plazaSeleccionada, hasDeps: !!rbDependencias[rbSeleccionada]})  // Remove debug

  if(!rbSeleccionada) return

  /* auto completar plaza */
  if(plazaSeleccionada){
    plaza.value = plazaSeleccionada
    if(plaza.value !== plazaSeleccionada){
    plaza.value = plazaSeleccionada
    }
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

const iconoContainer = document.getElementById("radiobaseIcon")

tipoAfectacion.addEventListener("change", () => {

    /* limpiar clases */
    iconoContainer.classList.remove(
        "afectacion-total",
        "afectacion-parcial",
        "afectacion-ok",
        "default-hover"
    )

    tipoAfectacionCell.classList.remove(
        "total",
        "parcial",
        "sinAfectacion"
    )

    const value = tipoAfectacion.value

    /* SIN SELECCION */
    if(value === "" || value === "Seleccionar"){
        iconoContainer.classList.add("default-hover")
        return
    }

    /* TOTAL */
    if(value.includes("Total")){
        iconoContainer.classList.add("afectacion-total")
        tipoAfectacionCell.classList.add("total")
    }

    /* PARCIAL */
    else if(value.includes("Parcial")){
        iconoContainer.classList.add("afectacion-parcial")
        tipoAfectacionCell.classList.add("parcial")
    }

    /* SIN AFECTACION */
    else if(value.includes("Sin afectación")){
        iconoContainer.classList.add("afectacion-ok")
        tipoAfectacionCell.classList.add("sinAfectacion")
    }

})

// const icono = document.querySelector("#radiobaseIcon i")

/* limpiar clases */

// radiobaseIcon.classList.remove(
// "afectacion-total",
// "afectacion-parcial",
// "afectacion-ok",
// "default-hover"
// )

// tipoAfectacionCell.classList.remove(
// "total",
// "parcial",
// "sinAfectacion"
// )

// const value = tipoAfectacion.value

// // /* SIN SELECCION */

// // if(value === "" || value === "Seleccionar"){

// // icono.className = ""
// // icono.classList.add("fas","fa-tower-cell")

// // radiobaseIcon.classList.add("default-hover")

// // return

// // }

// // /* TOTAL */

// // if(value.includes("Total")){

// // icono.className = ""
// // icono.classList.add("fas","fa-tower-broadcast")

// // radiobaseIcon.classList.add("afectacion-total")
// // tipoAfectacionCell.classList.add("total")

// // }

// // /* PARCIAL */

// // else if(value.includes("Parcial")){

// // icono.className = ""
// // icono.classList.add("fas","fa-triangle-exclamation")

// // radiobaseIcon.classList.add("afectacion-parcial")
// // tipoAfectacionCell.classList.add("parcial")

// // }

// // /* SIN AFECTACION */

// // else if(value.includes("Sin afectación")){

// // icono.className = ""
// // icono.classList.add("fas","fa-tower-cell")

// // radiobaseIcon.classList.add("afectacion-ok")
// // tipoAfectacionCell.classList.add("sinAfectacion")

// // }

// // })

/* ============================
BUSCADOR GLOBAL DE RADIOBASES
============================ */
document.addEventListener("click",(e)=>{

if(!e.target.closest(".radiobaseCell")){

rbListado.innerHTML=""

}

})

