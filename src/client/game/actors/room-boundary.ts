import Actor from '../actor';

export default class RoomBoundary extends Actor {
  get defaultConfig() {
    return {
      type: 'RoomBoundary',
      groups: ['boundary'], 
    }
  }
  
  setupGameObjects({x = 0, y = 0, width = 1, height = 1}) {
    const { scene } = this.room.manager;
    const main = scene.add.zone(x, y, width, height);
    main.setOrigin(0,0);
    scene.physics.add.existing(main, true /* isStatic */);
    return { main };
  }

}
