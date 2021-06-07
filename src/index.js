import "./simple.min.css";
import * as pako from "pako";
import { HttpAgent, Cbor } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { send_message } from "./bare-agent.js";

const data = {
  version: 1,
  creation: "2021-06-05 21:32:28 UTC",
  expiration: "2021-06-05 21:37:28 UTC",
  network: "https://ic0.app",
  call_type: "query",
  sender: "y5mgz-ye6pv-bg3mu-purwq-cowuz-gkva5-hdsrv-leuqd-53hfi-kyjr4-oae",
  canister_id: "k54e2-ciaaa-aaaab-aaaka-cai",
  method_name: "remaining_cycles",
  arg: [68, 73, 68, 76, 0, 0],
  request_id: null,
  content:
    "d9d9f7a367636f6e74656e74a66c726571756573745f747970656571756572796e696e67726573735f6578706972791b1685cd5ef1accd406673656e646572581d9e7d426db28fa46d013ad4c9955074e3946ab25203eece542b098f1c026b63616e69737465725f69644a000000000020001401016b6d6574686f645f6e616d657072656d61696e696e675f6379636c657363617267464449444c00006d73656e6465725f7075626b6579582c302a300506032b6570032100702ea1af2d7dd450a2d82ec233726cd1c7473471831b1fe085921ca66710c5cc6a73656e6465725f7369675840554ca488a01da25179a004f40e07bc66b2c96d9aa46fdffe815480ccdb71df80423d8ef6b1f1031ee3fe4b2a249aafff61cfbcaccf293f9e551144923bd40308",
};

// convert base64 string into ArrayBuffer
async function decode_base64(data) {
  const encoded = "data:image/png;base64," + data;
  const fetched = await fetch(encoded);
  const blob = await fetched.blob();
  const buffer = await blob.arrayBuffer();
  return buffer;
}

function fromHexString(hexString) {
  return new Uint8Array(
    (hexString.match(/.{1,2}/g) ?? []).map((byte) => parseInt(byte, 16))
  );
}

//console.log(Cbor.decode(fromHexString(data.content)));

/*
agent.query(data.canister_id, { arg: fromHexString(data.content), methodName: data.method_name }).then(response => {
	console.log(response)
}).catch(err => {
	console.log(err)
});
*/
import { scanImageData } from "zbar.wasm";
const SCAN_PROID_MS = 800;

function resize_canvas() {
  var video = document.getElementById("video");
  var canvas = document.getElementById("canvas");
  canvas.width = video.offsetWidth;
  canvas.height = video.offsetHeight;
}

async function init() {
  window.onresize = resize_canvas;
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: "environment" },
  });
  const video = document.getElementById("video");
  video.srcObject = mediaStream;
  video.setAttribute("playsinline", "");
  video.play();
  await new Promise((r) => {
    video.onloadedmetadata = r;
  });
  resize_canvas();
}

function render(symbols, image_width, image_height) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const xfactor = width / image_width;
  const yfactor = height / image_height;
  ctx.clearRect(0, 0, width, height);
  ctx.font = "20px serif";
  ctx.strokeStyle = "#00ff00";
  ctx.fillStyle = "#ff0000";
  ctx.lineWidth = 6;
  for (let i = 0; i < symbols.length; ++i) {
    const sym = symbols[i];
    const points = sym.points;
    ctx.beginPath();
    for (let j = 0; j < points.length; ++j) {
      const { x, y } = points[j];
      if (j === 0) {
        ctx.moveTo(x * xfactor, y * yfactor);
      } else {
        ctx.lineTo(x * xfactor, y * yfactor);
      }
    }
    ctx.closePath();
    ctx.stroke();
    //ctx.fillText("#" + i, points[0].x, points[0].y - 10);
  }
}

var scan_paused = false;
async function scan() {
  if (scan_paused) {
    return;
  }
  // Remove existing scanned results if any
  const result = document.getElementById("result");
  while (result.firstChild) {
    result.removeChild(result.lastChild);
  }
  const image = document.createElement("canvas");
  const video = document.getElementById("video");
  const width = video.videoWidth;
  const height = video.videoHeight;
  image.width = width;
  image.height = height;
  const ctx = image.getContext("2d");
  ctx.drawImage(video, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);
  const res = await scanImageData(imgData);
  //console.log(res, Date.now());
  if (res.length > 0) {
    console.log(res, Date.now());
    try {
      const encoded = String.fromCharCode.apply(null, res[0].data);
      const gzipped = await decode_base64(encoded);
      const unzipped = pako.inflate(gzipped, { to: "string" });
      console.log(unzipped);
      const message = JSON.parse(unzipped);
      console.log(message);
      render(res, width, height);
      prepare_send(message);
    } catch (err) {
      console.log(err);
    }
  }
}

function resume_scan() {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("video").play();
  const scan_button = document.getElementById("scan");
  scan_button.disabled = true;
  scan_paused = false;
}

function prepare_send(message) {
  scan_paused = true;
  const scan_button = document.getElementById("scan");
  scan_button.disabled = false;
  scan_button.onclick = resume_scan;
  document.getElementById("video").pause();
  const content = message.ingress ? message.ingress.content : message.content;
  const ingress = Cbor.decode(fromHexString(content));
  console.log(ingress);
  const text =
    "Request type : " +
    ingress.content.request_type +
    "\nSender       : " +
    new Principal(ingress.content.sender).toString() +
    "\nCanister id  : " +
    new Principal(ingress.content.canister_id).toString() +
    "\nMethod name  : " +
    ingress.content.method_name +
    "\nArguments    : " +
    JSON.stringify(ingress.content.arg);
  const result = document.getElementById("result");
  const pre = document.createElement("pre");
  pre.innerText = text;
  result.appendChild(pre);
  const button = document.createElement("button");
  button.id = "send";
  button.innerHTML = "Send";
  button.onclick = do_send(message);
  result.appendChild(button);
}

function do_send(message) {
  return async () => {
    const send_button = document.getElementById("send");
    send_button.disabled = true;
    send_button.innerHTML = "Sent";
    const result = document.getElementById("result");
    const pre = document.createElement("pre");
    const update_status = (reply) => {
      if (typeof reply != "string") {
        reply = JSON.stringify(reply);
      }
      pre.innerText = reply;
    };
    pre.id = "status";
    result.appendChild(pre);
    await send_message(message, update_status, sleep);
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  try {
    await init();
    while (true) {
      await scan();
      await sleep(SCAN_PROID_MS);
    }
  } catch (err) {
    const div = document.createElement("div");
    div.innerText = "Cannot get camera: " + err;
    document.body.appendChild(div);
    console.error(err);
  }
}

main();
