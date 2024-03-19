export class Node<K extends number | string, V> {
    /**
     * Key to compare
    */
    key: K

    /**
     * value to store
    */
    value: V

    /**
     * color of the node
     * true='red',
     * false='black'
    */
    isRed: boolean

    /**
     * left node
    */
    left: Node<K, V> | null

    /**
     * right node
    */
    right: Node<K, V> | null

    /**
     * top/parent node
    */
    parent: Node<K, V> | null

    /**
     * create new node and set left, right and parent to null
     * @param key key of the node to compare
     * @param val value/data to store in the node
     * @param [clr='R'] color of the node
    */
    constructor(key: K, val: V, clr = true) {
        this.key = key
        this.value = val
        this.isRed = clr
        this.left = this.right = this.parent = null
    }
}
