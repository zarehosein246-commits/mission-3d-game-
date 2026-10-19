import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8bb3c0);
scene.fog = new THREE.Fog(0x8bb3c0, 24, 65);
const camera = new THREE.PerspectiveCamera(68, innerWidth/innerHeight, .1, 120);
const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xc9f2ff,0x29382e,2.0));
const sun = new THREE.DirectionalLight(0xffe2b1,2.3);
sun.position.set(-12,22,10); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); scene.add(sun);

const mat=(color,roughness=.9,emissive=null)=>{const m=new THREE.MeshStandardMaterial({color,roughness});if(emissive){m.emissive=new THREE.Color(emissive);m.emissiveIntensity=1.4;}return m;};
const groundMat=mat(0x344b40), stone=mat(0x64736a), stoneDark=mat(0x3b4d46), blue=mat(0x18d9ff,.35,0x007bff), green=mat(0x4aff9a,.35,0x00ff63);
const ground=new THREE.Mesh(new THREE.BoxGeometry(48,1,48),groundMat);ground.position.y=-.55;ground.receiveShadow=true;scene.add(ground);
function block(x,y,z,sx,sy,sz,material=stone){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;}
for(let i=0;i<13;i++){let a=i*Math.PI*2/13;let r=21;block(Math.cos(a)*r,1.1,Math.sin(a)*r,2.2,2.2,2.2,stoneDark);}
block(-7,1.3,-5,1.2,2.6,8);block(5,1,-8,7,2,1);block(-11,1.6,4,1.5,3.2,1.5);block(1,.55,4,6,1.1,.7);block(10,1.3,7,1.2,2.6,7);block(13,2.5,-8,.8,5,.8);block(14.8,4.7,-8,4.4,.7,.8);
for(let i=0;i<18;i++){let x=(Math.random()-.5)*36,z=(Math.random()-.5)*36;if(Math.abs(x)<3&&Math.abs(z)<4)continue;const rock=block(x,.15,z,.5+Math.random(),.3+Math.random()*.6,.5+Math.random(),i%2?stone:stoneDark);rock.rotation.y=Math.random()*3;}
const player=new THREE.Group();scene.add(player);player.position.set(0,0,13);
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.9,4,8),mat(0xff7a35));body.position.y=1.05;body.castShadow=true;player.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.28,12,10),mat(0xe7c7a5));head.position.y=1.8;player.add(head);
const backpack=new THREE.Mesh(new THREE.BoxGeometry(.48,.55,.22),mat(0x1d4239));backpack.position.set(0,1.15,-.32);player.add(backpack);
const keys={};let touch={forward:false,back:false,left:false,right:false};let yaw=0,pitch=-.12,vy=0,onGround=true,started=false,won=false,count=0;
const cores=[];
function core(x,z){const g=new THREE.Group();g.position.set(x,.95,z);const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.48,1),blue);orb.castShadow=true;g.add(orb);const ring=new THREE.Mesh(new THREE.TorusGeometry(.7,.055,8,24),blue);ring.rotation.x=Math.PI/2;g.add(ring);scene.add(g);cores.push(g);}
core(-10,-10);core(8,-1);core(-2,10);
const exit=new THREE.Group();exit.position.set(15,0,12);const pillar=new THREE.Mesh(new THREE.CylinderGeometry(.22,.32,3,10),green);pillar.position.y=1.5;exit.add(pillar);const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.12,8,28),green);ring.position.y=.5;ring.rotation.x=Math.PI/2;exit.add(ring);scene.add(exit);
const objective=document.querySelector('#objective'),countEl=document.querySelector('#count'),message=document.querySelector('#message'),startScreen=document.querySelector('#startScreen');
function say(s){message.textContent=s;message.style.display='block';}
document.querySelector('#startBtn').addEventListener('click',()=>{started=true;startScreen.style.display='none';say('سه کریستال آبی را پیدا کن!');setTimeout(()=>{if(!won)message.style.display='none';},2600);});
addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Escape')document.exitPointerLock?.();});
addEventListener('keyup',e=>keys[e.code]=false);
renderer.domElement.addEventListener('click',()=>{if(started && matchMedia('(pointer:fine)').matches)renderer.domElement.requestPointerLock?.();});
addEventListener('mousemove',e=>{if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0025;pitch=Math.max(-.55,Math.min(.4,pitch-e.movementY*.002));}});
let dragging=false,lastX=0,lastY=0;
renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'){dragging=true;lastX=e.clientX;lastY=e.clientY;}});
renderer.domElement.addEventListener('pointermove',e=>{if(dragging&&e.pointerType!=='mouse'){yaw-=(e.clientX-lastX)*.006;pitch=Math.max(-.55,Math.min(.4,pitch-(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY;}});
addEventListener('pointerup',()=>dragging=false);
document.querySelectorAll('[data-move]').forEach(b=>{const k=b.dataset.move;const set=v=>touch[k]=v;b.addEventListener('pointerdown',e=>{e.preventDefault();set(true);b.setPointerCapture?.(e.pointerId);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>set(false));});
let jumpRequested=false;const jumpBtn=document.querySelector('#jumpBtn');jumpBtn.addEventListener('pointerdown',e=>{e.preventDefault();jumpRequested=true;});
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));}
addEventListener('resize',resize);
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.035);cores.forEach((c,i)=>{c.rotation.y+=dt*1.2;c.position.y=.95+Math.sin(performance.now()*.002+i)*.12;});
exit.rotation.y+=dt*.55;
if(started&&!won){
 let f=(keys.KeyW||keys.ArrowUp||touch.forward?1:0)-(keys.KeyS||keys.ArrowDown||touch.back?1:0);
 let r=(keys.KeyD||keys.ArrowRight||touch.right?1:0)-(keys.KeyA||keys.ArrowLeft||touch.left?1:0);
 const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));const move=forward.multiplyScalar(f).add(right.multiplyScalar(r));
 if(move.lengthSq()>0){move.normalize();player.position.addScaledVector(move,dt*5.5);player.rotation.y=Math.atan2(move.x,move.z);}
 if((keys.Space||jumpRequested)&&onGround){vy=7;onGround=false;}jumpRequested=false;
 vy-=18*dt;player.position.y+=vy*dt;if(player.position.y<=0){player.position.y=0;vy=0;onGround=true;}
 player.position.x=Math.max(-20,Math.min(20,player.position.x));player.position.z=Math.max(-20,Math.min(20,player.position.z));
 for(let i=cores.length-1;i>=0;i--){if(player.position.distanceTo(cores[i].position)<1.35){scene.remove(cores[i]);cores.splice(i,1);count++;countEl.textContent=`کریستال‌ها: ${count} / 3`;say(count<3?'کریستال پیدا شد! بقیه را هم پیدا کن.':'عالیه! حالا به دروازهٔ سبز برو.');setTimeout(()=>{if(!won)message.style.display='none';},2200);}}
 if(count===3&&player.position.distanceTo(exit.position)<2.2){won=true;objective.textContent='مأموریت کامل شد!';say('پیروزی! هر سه کریستال را پیدا کردی. صفحه را تازه کن تا دوباره بازی کنی.');}
}
const target=new THREE.Vector3(player.position.x,player.position.y+1.35,player.position.z);
const dist=5.5;const offset=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch)*dist,Math.sin(pitch)*dist+1.3,Math.cos(yaw)*Math.cos(pitch)*dist);
camera.position.lerp(target.clone().add(offset),.16);camera.lookAt(target);
renderer.render(scene,camera);}
animate();
