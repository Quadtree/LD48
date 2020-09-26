import { LocalNetDriver } from "../net/drivers/local/LocalNetDriver"
import { BaseChannel } from "../net/drivers/BaseChannel"
import { ActorManager } from "../am/ActorManager"
import { NetworkManager } from "../net/NetworkManager"
import { replicated } from "../net/annotations/Replicated"
import { runOnServer, runOnAll } from "../net/annotations/RPC"
import { Actor } from "../am/Actor"

class TestReplicatedActor extends Actor
{
    @replicated
    public v:number = 4

    public name:string = 'client'

    public wasCalled:number = 0

    public wasCalled2:number = 0

    @runOnServer
    public someServerFunc(){
        console.log(`my name is ${this.name}`)
        this.wasCalled++
    }

    @runOnAll
    public someAllFunc(){
        if (!this) throw new Error('this is not valid')
        console.log(`someAllFunc called on ${this.name}`)
        this.wasCalled2++
    }
}

describe("suite1", function(){
    it("should be able to pass dummy messages", function() {
        const driver = new LocalNetDriver()

        const serverChannels:BaseChannel[] = []

        driver.listen((channel) => serverChannels.push(channel))

        const clientChannel = driver.connect("test")

        clientChannel.send('client message')

        expect(serverChannels[0].recv()).toEqual('client message')

        serverChannels[0].send('server message')

        expect(clientChannel.recv()).toEqual('server message')
    })

    it('should handle basic replication', function(){
        const driver = new LocalNetDriver()

        const serverActorManager = new ActorManager()
        const clientActorManager = new ActorManager()
        const clientActorManager2 = new ActorManager()

        const serverNetworkManager = new NetworkManager(driver, serverActorManager)
        const clientNetworkManager = new NetworkManager(driver, clientActorManager)
        const clientNetworkManager2 = new NetworkManager(driver, clientActorManager2)

        serverNetworkManager.debug = true
        clientNetworkManager.debug = true
        clientNetworkManager2.debug = true

        serverNetworkManager.listen()
        clientNetworkManager.connect('test')
        clientNetworkManager2.connect('test')

        const testServerActor = new TestReplicatedActor()
        testServerActor.v = 9
        testServerActor.name = 'server'

        serverActorManager.add(testServerActor)

        for (let i=0;i<2;++i){
            serverNetworkManager.forceReplication()
            serverActorManager.update(0.016)
            clientActorManager.update(0.016)
            clientActorManager2.update(0.016)
        }

        expect(serverActorManager.actors.length).toEqual(1)
        expect(clientActorManager.actors.length).toEqual(1)
        expect(clientActorManager2.actors.length).toEqual(1)

        expect((serverActorManager.actors[0] as TestReplicatedActor).v).toEqual(9)
        expect((clientActorManager.actors[0] as TestReplicatedActor).v).toEqual(9);
        expect((clientActorManager2.actors[0] as TestReplicatedActor).v).toEqual(9);

        console.log('*** testing someServerFunc() ***');

        (clientActorManager.actors[0] as TestReplicatedActor).someServerFunc()

        for (let i=0;i<2;++i){
            serverNetworkManager.forceReplication()
            serverActorManager.update(0.016)
            clientActorManager.update(0.016)
            clientActorManager2.update(0.016)
        }

        expect((serverActorManager.actors[0] as TestReplicatedActor).wasCalled).toEqual(1)
        expect((clientActorManager.actors[0] as TestReplicatedActor).wasCalled).toEqual(0);
        expect((clientActorManager2.actors[0] as TestReplicatedActor).wasCalled).toEqual(0);

        (clientActorManager.actors[0] as TestReplicatedActor).someAllFunc()

        for (let i=0;i<2;++i){
            serverNetworkManager.forceReplication()
            serverActorManager.update(0.016)
            clientActorManager.update(0.016)
            clientActorManager2.update(0.016)
        }

        expect((serverActorManager.actors[0] as TestReplicatedActor).wasCalled2).toEqual(1)
        expect((clientActorManager.actors[0] as TestReplicatedActor).wasCalled2).toEqual(1);
        expect((clientActorManager2.actors[0] as TestReplicatedActor).wasCalled2).toEqual(1);
    })
})