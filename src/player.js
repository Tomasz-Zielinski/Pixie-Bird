import Textures from './textures';
import Sound from './audio';

class Player {
  constructor() { this.constructor() };
}

Player.prototype.constructor = function () {

  this.score = 0;
  this.mass = 3;
  this.velocity = new THREE.Vector3(3, 0, 0);
  this.mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50, 32),
    new THREE.MeshPhongMaterial({ transparent: true, map: Textures['flyingPixie'] })
  )
  this.mesh.translateZ(255);

}

Player.prototype.update = function (delta) {

  this.box = new THREE.Box3().setFromObject(this.mesh);

  this.velocity.y -= 9.81 * this.mass * delta;

  this.mesh.position.y += this.velocity.y;
  this.mesh.position.x += this.velocity.x;

  this.mesh.rotation.z = this.velocity.y < 0 ? this.mesh.rotation.z - 0.01 : this.mesh.rotation.z + 0.01;

  if (this.mesh.position.x > window.innerWidth) this.mesh.position.x = - window.innerWidth;
}

Player.prototype.jump = function () {

  this.velocity.y = 10;
  Sound.play('wing');

}

Player.prototype.checkCollision = function (column) {

  let column_box = new THREE.Box3().setFromObject(column);

  if (this.box.min.x < column_box.getSize(new THREE.Vector3()).x + column_box.min.x &&
    this.box.min.x + this.box.getSize(new THREE.Vector3()).x > column_box.min.x && !column.passed) {
    column.passed = true;
    this.score = this.score + 0.5;
  }

  if (this.velocity.x == 0) {
    setTimeout(() => this.restart(), 1000)
  } else {
    if (this.box.min.x < column_box.getSize(new THREE.Vector3()).x + column_box.min.x &&
      this.box.min.x + this.box.getSize(new THREE.Vector3()).x > column_box.min.x &&
      this.box.min.y < column_box.getSize(new THREE.Vector3()).y + column_box.min.y &&
      this.box.min.y + this.box.getSize(new THREE.Vector3()).y > column_box.min.y) {
      this.hit();
    }
    if (this.mesh.position.y > window.innerHeight / 2 || this.mesh.position.y < -window.innerHeight / 2) {
      this.hit();
    }
  }
}

Player.prototype.hit = function () {

  this.velocity.x = 0;
  this.velocity.y = -1;
  Sound.play('hit');

}

Player.prototype.restart = function () {

  this.mesh.position.x = 5;
  this.mesh.position.y = 0;

  this.mesh.rotation.z = 0;

  this.velocity.x = 3;
  this.velocity.y = 0;

}

export default Player;
