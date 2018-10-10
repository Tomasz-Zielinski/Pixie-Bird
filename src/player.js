import { Textures, WIDTH, HEIGHT } from './textures';
import Sound from './audio';

class Player {
  constructor(scene) { this.constructor(scene) };
}

Player.prototype.constructor = function (scene) {

  this.isAlive = true;
  this.score = 0;
  this.mass = 3;
  this.speed = 3;
  this.audio = Sound;
  this.scene = scene
  this.velocity = new THREE.Vector3(this.speed, 0, 0);
  this.mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(WIDTH / 50, WIDTH / 50, 32),
    new THREE.MeshPhongMaterial({ transparent: true, map: Textures['flyingPixie'] })
  )
  this.mesh.translateZ(255);

}

Player.prototype.update = function (delta) {

  this.box = new THREE.Box3().setFromObject(this.mesh);

  this.velocity.y -= 9.81 * this.mass * delta;
  this.isAlive ? null : this.mesh.rotation.z += 0.1;

  this.mesh.position.y += this.velocity.y;
  this.mesh.position.x += this.velocity.x;

  this.mesh.rotation.z = this.velocity.y < 0 ? this.mesh.rotation.z - 0.01 : this.mesh.rotation.z;
  this.mesh.rotation.z = this.velocity.y > 0 ? this.mesh.rotation.z + 0.01 : this.mesh.rotation.z;

  this.mesh.position.x = this.mesh.position.x > WIDTH ? - WIDTH : this.mesh.position.x;

}

Player.prototype.jump = function () {

  this.velocity.y = 10;
  this.audio.play('wing');

}

Player.prototype.checkCollision = function (columnList) {

  const closest = columnList.reduce((accumulator, column) =>
    Math.abs(new THREE.Box3().setFromObject(column).min.x - this.mesh.position.x) < accumulator ?
      Math.abs(new THREE.Box3().setFromObject(column).min.x - this.mesh.position.x) : accumulator, Infinity)

  columnList = columnList.filter(column => Math.abs(new THREE.Box3().setFromObject(column).min.x - this.mesh.position.x) == closest);

  columnList.forEach(column => {

    const column_box = new THREE.Box3().setFromObject(column);

    if (this.box.min.x < column_box.getSize(new THREE.Vector3()).x + column_box.min.x &&
      this.box.min.x + this.box.getSize(new THREE.Vector3()).x > column_box.min.x && !column.passed) {
      column.passed = true;
      this.audio.play('swooshing');
      this.updateScore(this.score + 0.5);
    }

    if (this.velocity.x != 0) {
      if (this.box.min.x < column_box.getSize(new THREE.Vector3()).x + column_box.min.x &&
        this.box.min.x + this.box.getSize(new THREE.Vector3()).x > column_box.min.x &&
        this.box.min.y < column_box.getSize(new THREE.Vector3()).y + column_box.min.y &&
        this.box.min.y + this.box.getSize(new THREE.Vector3()).y > column_box.min.y) {
        this.hit();
      }
      if (this.mesh.position.y > HEIGHT / 2 || this.mesh.position.y < -HEIGHT / 2) {
        this.hit();
      }
    }
  })

}

Player.prototype.checkPickup = function () {

}

Player.prototype.hit = function () {

  this.isAlive = false;
  this.velocity.x = 0;
  this.velocity.y = 10;
  this.audio.play('hit');
  setTimeout(() => this.audio.play('die'), this.audio['hit'].duration * 1000);
  setTimeout(() => {
    const playButton = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(128, 128, 1),
      new THREE.MeshPhongMaterial({ transparent: true, map: Textures['playButton'] })
    );
    playButton.position.x = this.mesh.position.x;
    this.playButton = playButton;
    this.scene.add(playButton)
  }, (this.audio['die'].duration + this.audio['hit'].duration) * 1000);

}

Player.prototype.restart = function () {

  this.isAlive = true;

  this.mesh.position.x = 0;
  this.mesh.position.y = 0;

  this.mesh.rotation.z = 0;

  this.velocity.x = this.speed;
  this.velocity.y = 0;

  this.updateScore(0);

}

Player.prototype.updateScore = function (score) {

  this.score = score;
  document.querySelector('.score').textContent = this.score;

}

export default Player;
