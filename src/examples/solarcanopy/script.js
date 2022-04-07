import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/loaders/3DMLoader.js'
import rhino3dm from 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js'

// set up loader for converting the results to threejs
const loader = new Rhino3dmLoader()
loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/' )

// initialise 'data' object that will be used by compute()
const data = {
  definition: 'solarcanopy.gh',
  inputs: getInputs()
} 

// globals
let rhino, doc

rhino3dm().then(async m => {
    rhino = m

    init()
    compute()
})

const downloadButton = document.getElementById("downloadButton")
downloadButton.onclick = download
/* 
const downloadButton = document.getElementById("htmlButton")
downloadButton.onclick = download 
*/

  /////////////////////////////////////////////////////////////////////////////
 //                            HELPER  FUNCTIONS                            //
/////////////////////////////////////////////////////////////////////////////

/**
 * Gets <input> elements from html and sets handlers
 * (html is generated from the grasshopper definition)
 */
function getInputs() {
  const inputs = {}
  for (const input of document.getElementsByTagName('input')) {
    switch (input.type) {
      case 'number':
        inputs[input.id] = input.valueAsNumber
        input.onchange = onSliderChange
        break
      case 'range':
        inputs[input.id] = input.valueAsNumber
        input.onmouseup = onSliderChange
        input.ontouchend = onSliderChange
        break
      case 'checkbox':
        inputs[input.id] = input.checked
        input.onclick = onSliderChange
        break
      default:
        break
    }
  }
  return inputs
}

// more globals
let scene, camera, renderer, controls, PAnum, PAarea, PAangle, PBnum, PBarea, PBangle, PCnum, PCarea, PCangle, PDnum, PDarea, PDangle, PTnum, PTarea

/**
 * Sets up the scene, camera, renderer, lights and controls and starts the animation
 */
function init() {

    // Rhino models are z-up, so set this as the default
    THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );

    // create a scene and a camera
    scene = new THREE.Scene()
    scene.background = new THREE.Color('blue')
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(1, -1, 1.5) // like perspective view

    // very light grey for background, like rhino
    scene.background = new THREE.Color('blue')

    // create the renderer and add it to the html
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio( window.devicePixelRatio )
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    // add some controls to orbit the camera
    controls = new OrbitControls(camera, renderer.domElement)

    // add a directional light
    const directionalLight = new THREE.DirectionalLight( 0xffffff )
    directionalLight.position.set( 0, 0, 0 )
    directionalLight.castShadow = false
    directionalLight.intensity = 2
    scene.add( directionalLight )

    const ambientLight = new THREE.AmbientLight()
    scene.add( ambientLight )

    // handle changes in the window size
    window.addEventListener( 'resize', onWindowResize, false )

    animate()
}

/**
 * Call appserver
 */
async function compute() {

  // construct url for GET /solve/definition.gh?name=value(&...)
  const url = new URL('/solve/' + data.definition, window.location.origin)
  Object.keys(data.inputs).forEach(key => url.searchParams.append(key, data.inputs[key]))
  console.log(url.toString())
  
  try {
    const response = await fetch(url)
  
    if(!response.ok) {
      // TODO: check for errors in response json
      throw new Error(response.statusText)
    }

    const responseJson = await response.json()

    collectResults(responseJson)

  } catch(error) {
    console.error(error)
  }
}

/**
 * Parse response
 */
function collectResults(responseJson) {

    const values = responseJson.values

    // clear doc
    if( doc !== undefined)
        doc.delete()

    //console.log(values)
    doc = new rhino.File3dm()

    // for each output (RH_OUT:*)...
    for ( let i = 0; i < values.length; i ++ ) {
      // ...iterate through data tree structure...
      for (const path in values[i].InnerTree) {
        const branch = values[i].InnerTree[path]
        // ...and for each branch...
        for( let j = 0; j < branch.length; j ++) {
          // ...load rhino geometry into doc
          const rhinoObject = decodeItem(branch[j])

           //GET VALUES PANELS A
           if (values[i].ParamName == "RH_OUT:PAnum") {
            //PAnum = JSON.parse(responseJson.values[i].InnerTree['{ 0; }'][0].data)
            PAnum = Math.round(branch[j].data)
            console.log(PAnum)
          }

          if (values[i].ParamName == "RH_OUT:PAarea") {
            //PAarea = JSON.parse(responseJson.values[i].InnerTree['{ 0; }'][0].data)
            PAarea = Math.round(branch[j].data)
            console.log(PAarea)
          }

          if (values[i].ParamName == "RH_OUT:PAangle") {
            //PAangle = JSON.parse(responseJson.values[i].InnerTree['{ 0; }'][0].data)
            PAangle = Math.round(branch[j].data)
            console.log(PAangle)
          }

           //GET VALUES PANELS B
           if (values[i].ParamName == "RH_OUT:PBnum") {
            //PBnum = JSON.parse(responseJson.values[i].InnerTree['{ 0; }'][0].data)
            PBnum = Math.round(branch[j].data)
            console.log(PBnum)
          }

          if (values[i].ParamName == "RH_OUT:PBarea") {
            //PBarea = JSON.parse(responseJson.values[i].InnerTree['{ 0; }'][0].data)
            PBarea = Math.round(branch[j].data)
            console.log(PBarea)
          }

          if (values[i].ParamName == "RH_OUT:PBangle") {
            //PBangle = JSON.parse(responseJson.values[i].InnerTree['{ 0; }'][0].data)
            PBangle = Math.round(branch[j].data)
            console.log(PBangle)
          }
          
           //GET VALUES PANELS C
           if (values[i].ParamName == "RH_OUT:PCnum") {
            //PCnum = JSON.parse(responseJson.values[i].InnerTree['{ 0; }'][0].data)
            PCnum = Math.round(branch[j].data)
            console.log(PCnum)
          }

          if (values[i].ParamName == "RH_OUT:PCarea") {
            //PCarea = JSON.parse(responseJson.values[i].InnerTree['{ 0; }'][0].data)
            PCarea = Math.round(branch[j].data)
            console.log(PCarea)
          }

          if (values[i].ParamName == "RH_OUT:PCangle") {
            //PCangle = JSON.parse(responseJson.values[i].InnerTree['{ 0; }'][0].data)
            PCangle = Math.round(branch[j].data)
            console.log(PCangle)
          }

           //GET VALUES PANELS D
           if (values[i].ParamName == "RH_OUT:PDnum") {
            //PDnum = JSON.parse(responseJson.values[i].InnerTree['{ 0; }'][0].data)
            PDnum = Math.round(branch[j].data)
            console.log(PDnum)
          }

          if (values[i].ParamName == "RH_OUT:PDarea") {
            //PDarea = JSON.parse(responseJson.values[i].InnerTree['{ 0; }'][0].data)
            PDarea = Math.round(branch[j].data)
            console.log(PDarea)
          }

          if (values[i].ParamName == "RH_OUT:PDangle") {
            //PDangle = JSON.parse(responseJson.values[i].InnerTree['{ 0; }'][0].data)
            PDangle = Math.round(branch[j].data)
            console.log(PDangle)
          }

           //GET VALUES PANELS TOTAL
          if (values[i].ParamName == "RH_OUT:PTnum") {
            //PTnum = JSON.parse(responseJson.values[i].InnerTree['{ 0; }'][0].data)
            PTnum = Math.round(branch[j].data)
            console.log(PTnum)
          }
          
          if (values[i].ParamName == "RH_OUT:PTarea") {
            //PTarea = JSON.parse(responseJson.values[i].InnerTree['{ 0; }'][0].data)
            PTarea = Math.round(branch[j].data)
            console.log(PTarea)
          }

          if (rhinoObject !== null) {
            doc.objects().add(rhinoObject, null)
          }
        }
      }
    }

      //GET VALUES
      document.getElementById('PAnum').innerText = "Number = " + PAnum + " units"
      document.getElementById('PAarea').innerText = "Area = " + PAarea + " m2"
      document.getElementById('PAangle').innerText = "Angle = " + PAangle + " º"

      document.getElementById('PBnum').innerText = "Number = " + PBnum + " units"
      document.getElementById('PBarea').innerText = "Area = " + PBarea + " m2"
      document.getElementById('PBangle').innerText = "Angle = " + PBangle + " º"

      document.getElementById('PCnum').innerText = "Number = " + PCnum + " units"
      document.getElementById('PCarea').innerText = "Area = " + PCarea + " m2"
      document.getElementById('PCangle').innerText = "Angle = " + PCangle + " º"

      document.getElementById('PDnum').innerText = "Number = " + PDnum + " units"
      document.getElementById('PDarea').innerText = "Area = " + PDarea + " m2"
      document.getElementById('PDangle').innerText = "Angle = " + PDangle + " º"

      document.getElementById('PTnum').innerText = "Total Number of Panels = " + PTnum + " units"
      document.getElementById('PTarea').innerText = "Total Area of Panels = " + PTarea + " m2"

    if (doc.objects().count < 1) {
      console.error('No rhino objects to load!')
      showSpinner(false)
      return
    }

    // hack (https://github.com/mcneel/rhino3dm/issues/353)
    doc.objects().addSphere(new rhino.Sphere([0,0,0], 1), null)

    // load rhino doc into three.js scene
    const buffer = new Uint8Array(doc.toByteArray()).buffer
    loader.parse( buffer, function ( object ) 
    { 

      // color Mesh
        object.traverse(function (child) {
        if (child.isMesh) {
            const material = new THREE.MeshNormalMaterial({ flatShading: true, transparent: true, opacity: 0.7})
            child.material = material
          }
        })

        /*
        object.traverse(child => {
        if (child.isMesh) {
          if (child.userData.attributes.geometry.userStringCount > 0) {
            //console.log(child.userData.attributes.geometry.userStrings[0][1])
            const col = child.userData.attributes.geometry.userStrings[0][1]
            const threeColor = new THREE.Color( "rgb(" + col + ")")
            const mat = new THREE.MeshPhysicalMaterial( {color: threeColor, transparent: true, opacity: 0.7})
            child.material = mat 
          } 
        } 
      }) */

      // color crvs
        object.traverse(child => {
        if (child.isLine) {
          if (child.userData.attributes.geometry.userStringCount > 0) {
            //console.log(child.userData.attributes.geometry.userStrings[0][1])
            const col = child.userData.attributes.geometry.userStrings[0][1]
            const threeColor = new THREE.Color( "rgb(" + col + ")")
            const mat = new THREE.LineBasicMaterial({color:threeColor})
            child.material = mat            
          }
        }
      })      
  

      // clear objects from scene. do this here to avoid blink
        scene.traverse(child => {
          if (!child.isLight) {
              scene.remove(child)
          }
      })

        // add object graph from rhino model to three.js scene
        scene.add( object )

        // hide spinner and enable download button
        showSpinner(false)
        downloadButton.disabled = false

        // zoom to extents
        zoomCameraToSelection(camera, controls, scene.children)
    })
}

/**
 * Attempt to decode data tree item to rhino geometry
 */
function decodeItem(item) {
  const data = JSON.parse(item.data)
  if (item.type === 'System.String') {
    // hack for draco meshes
    try {
        return rhino.DracoCompression.decompressBase64String(data)
    } catch {} // ignore errors (maybe the string was just a string...)
  } else if (typeof data === 'object') {
    return rhino.CommonObject.decode(data)
  }
  return null
}

/**
 * Called when a slider value changes in the UI. Collect all of the
 * slider values and call compute to solve for a new scene
 */
function onSliderChange () {
  showSpinner(true)
  // get slider values
  let inputs = {}
  for (const input of document.getElementsByTagName('input')) {
    switch (input.type) {
    case 'number':
      inputs[input.id] = input.valueAsNumber
      break
    case 'range':
      inputs[input.id] = input.valueAsNumber
      break
    case 'checkbox':
      inputs[input.id] = input.checked
      break
    }
  }
  
  data.inputs = inputs

  compute()
}

/**
 * The animation loop!
 */
function animate() {
  requestAnimationFrame( animate )
  controls.update()
  renderer.render(scene, camera)
}

/**
 * Helper function for window resizes (resets the camera pov and renderer size)
  */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize( window.innerWidth, window.innerHeight )
  animate()
}

/**
 * Helper function that behaves like rhino's "zoom to selection", but for three.js!
 */
function zoomCameraToSelection( camera, controls, selection, fitOffset = 1.2 ) {
  
  const box = new THREE.Box3();
  
  for( const object of selection ) {
    if (object.isLight) continue
    box.expandByObject( object );
  }
  
  const size = box.getSize( new THREE.Vector3() );
  const center = box.getCenter( new THREE.Vector3() );
  
  const maxSize = Math.max( size.x, size.y, size.z );
  const fitHeightDistance = maxSize / ( 2 * Math.atan( Math.PI * camera.fov / 360 ) );
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = fitOffset * Math.max( fitHeightDistance, fitWidthDistance );
  
  const direction = controls.target.clone()
    .sub( camera.position )
    .normalize()
    .multiplyScalar( distance );
  controls.maxDistance = distance * 10;
  controls.target.copy( center );
  
  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
  camera.position.copy( controls.target ).sub(direction);
  
  controls.update();
  
}

/**
 * This function is called when the download button is clicked
 */
function download () {
    // write rhino doc to "blob"
    const bytes = doc.toByteArray()
    const blob = new Blob([bytes], {type: "application/octect-stream"})

    // use "hidden link" trick to get the browser to download the blob
    const filename = data.definition.replace(/\.gh$/, '') + '.3dm'
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = filename
    link.click()
}

/**
 * Shows or hides the loading spinner
 */
function showSpinner(enable) {
  if (enable)
    document.getElementById('loader').style.display = 'block'
  else
    document.getElementById('loader').style.display = 'none'
}