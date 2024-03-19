import { Node } from "./node"

/**-----------------------------------------------------
 * Red Black tree for indexing.
 * ----
 *
 * @author Praveen yadav
 * @see https://github.com/pixiedevpraveen/speed-index/tree/master/docs/index.md
 * ---
 * @example
 * const tree = new SpeedIndex<number, string>();
 * tree.insert(23, "value of 23")
 * tree.find(23) // "value of 23"
 */
export class SpeedIndex<K extends number | string, V> {
    private root: Node<K, V> | null = null
    /**
     * min node
    */
    private mn: Node<K, V> | null = null
    /**
     * max node
    */
    private mx: Node<K, V> | null = null

    /**
     * insert key and value in the tree
    */
    insert(key: K, val: V): boolean {
        const n = new Node(key, val)

        let cn = this.root
        if (cn) {
            /**
             * current node to traverse
            */
            while (true) {
                if (key === cn.key)
                    return false
                else if (key < cn.key) {
                    if (!cn.left) {
                        cn.left = n
                        n.parent = cn
                        break
                    } else
                        cn = cn.left
                } else {
                    if (!cn.right) {
                        cn.right = n
                        n.parent = cn
                        break
                    } else
                        cn = cn.right
                }
            }
            this.fixTree(n)
        } else {
            this.root = n
            this.root.isRed = false
        }
        this.setMinMax(n)
        return true
    }

    private setMinMax(n: Node<K, V>) {
        if (!this.mx || this.mx.key < n.key)
            this.mx = n
        if (!this.mn || this.mn.key > n.key)
            this.mn = n
    }

    /**
     * find the value using the provided key
     * @param key key to find
    */
    find(key: K): V | undefined {
        return this.findNode(key)?.value
    }

    /**
     * @param lb lower bound
     * @param ub upper bound
    */
    findRange(lb: K, ub: K): V[] {
        let cn = this.root
        if (!cn) return []
        const res: V[] = [];
        let st: Node<K, V>[] = []; // Initialize stack with root node

        while (true) {
            if (cn) {
                st.push(cn)
                cn = cn.left
            } else if (st.length) {
                cn = st.pop()!
                if (cn.key >= lb && cn.key <= ub)
                    res.push(cn.value) // Process current node
                else if (cn.key > ub)
                    break // Stop processing nodes in right subtree 
                cn = cn.right // Process right subtree
            } else {
                break // Stack is empty and current node is null, so we're done 
            }
        }

        return res;
    }

    /**
     * @param ub upper bound
     * @returns array of pair of key and value less than or equal to
    */
    lte(ub: K): V[] {
        /**
         * result array
        */
        const r: V[] = []

        /**
         * Stack of nodes
        */
        const st: Node<K, V>[] = []
        /**
         * current node to traverse
        */
        let cn = this.root

        while (cn) {
            if (cn.key <= ub) {
                st.push(cn)
                cn = cn.right
            } else
                cn = cn.left
        }

        while (st.length > 0) {
            cn = st.pop()!
            r.push(cn.value)
            cn = cn.left
            while (cn) {
                st.push(cn)
                cn = cn.right
            }
        }

        return r
    }

    /**
     * @param lb lower bound
     * @returns array of pair of key and value greater than or equal to
    */
    gte(lb: K): V[] {
        const r: V[] = []
        let cn = this.root
        // Handle empty tree or invalid range
        if (!cn || lb >= this.maxNode()!.key) return r

        const st: Node<K, V>[] = []

        while (cn) {
            if (cn.key >= lb) {
                st.push(cn)
                cn = cn.left
            } else
                cn = cn.right
        }

        while (st.length > 0) {
            cn = st.pop()!

            r.push(cn.value)
            cn = cn.right
            while (cn) {
                st.push(cn)
                cn = cn.left
            }
        }

        return r
    }

    /**
     * update value from the 
    */
    update(key: K, val: V): V | undefined {
        /**
         * node to update
        */
        const n = this.findNode(key)
        if (n) {
            const p = n.value
            n.value = val
            return p
        }
    }

    /**
     * delete from the tree
     * @param key Key to find and delete the node
    */
    delete(key: K): V | undefined {
        const n = this.findNode(key)
        if (!n) return
        this.deleteNode(n)
        // TODO: assign min max from left, right or parent
        if (this.mx === n)
            this.mx = null
        if (this.mn === n)
            this.mn = null
        return n.value
    }

    /**
     * @param n node to fix
    */
    private fixTree(n: Node<K, V>): void {
        // Red-Black Tree insertion balancing rules
        while (n && n.parent && n.parent.isRed) {
            /**
             * uncle Node
            */
            let un: Node<K, V> | null
            if (n.parent === n.parent!.parent!.left)
                un = n.parent!.parent!.right
            else
                un = n.parent!.parent!.left

            if (un && un.isRed) {
                // Case 1: Recolor
                n.parent.isRed = false
                un.isRed = false
                n = n.parent.parent!
            } else {
                if (n === n.parent!.right && n.parent === n.parent!.parent!.left) {
                    // Case 2: Left rotation
                    n = n.parent
                    this.leftRotate(n)
                } else if (n === n.parent!.left && n.parent === n.parent!.parent!.right) {
                    // Case 3: Right rotation
                    n = n.parent
                    this.rightRotate(n)
                }

                // Case 4: Recolor and rotate (parent becomes black)
                n.parent!.isRed = false
                /**
                 * Grand parent
                */
                const gp = n.parent!.parent // Store grandparent (might be null)
                if (gp) { // Check for null grandparent before accessing properties
                    gp.isRed = true
                    if (n === n.parent!.left)
                        this.rightRotate(gp)
                    else
                        this.leftRotate(gp)
                }
            }
        }

        this.root!.isRed = false; // Ensure root is always black
    }

    /**
     * @param n node to rotate
    */
    private leftRotate(n: Node<K, V>): void {
        /**
         * Right child
        */
        const rc = n.right!
        n.right = rc.left
        if (rc.left)
            rc.left.parent = n
        rc.parent = n.parent

        if (!n.parent)
            this.root = rc
        else if (n === n.parent.left)
            n.parent.left = rc
        else
            n.parent.right = rc

        rc.left = n
        n.parent = rc
    }

    /**
     * @param n node to rotate
    */
    private rightRotate(n: Node<K, V>): void {
        /**
         * left child
        */
        const lc = n.left!
        n.left = lc.right

        if (lc.right)
            lc.right.parent = n

        lc.parent = n.parent

        if (!n.parent)
            this.root = lc
        else if (n === n.parent.left)
            n.parent.left = lc
        else
            n.parent.right = lc


        lc.right = n
        n.parent = lc
    }

    /**
     * find node using the key
    */
    private findNode(key: K): Node<K, V> | null {
        if (this.mn?.key === key) return this.mn
        if (this.mx?.key === key) return this.mx

        /**
         * current node to traverse
        */
        let cn = this.root
        while (cn) {
            if (key === cn.key)
                return cn
            else if (key < cn.key)
                cn = cn.left
            else
                cn = cn.right
        }

        return null
    }

    /**
     * @param n node from where to find min Node
    */
    private minFrom(n: Node<K, V>): Node<K, V> {
        let cn = n
        while (cn.left)
            cn = cn.left

        return cn
    }

    /**
     * find max Node
    */
    maxNode(): Node<K, V> | null {
        if (this.mx) return this.mx

        /**
         * current node to traverse
        */
        let cn = this.root
        while (cn && cn.right)
            cn = cn.right

        return this.mx = cn
    }

    /**
     * find min Node
    */
    minNode(): Node<K, V> | null {
        if (this.mn) return this.mn
        return this.root ? this.mn = this.minFrom(this.root) : null
    }

    /**
     * find min key value pair
    */
    min(): [K, V] | undefined {
        const n = this.minNode()
        if (n)
            return [n?.key, n?.value]
    }

    /**
     * find max key value pair
    */
    max(): [K, V] | undefined {
        const n = this.maxNode()
        if (n)
            return [n?.key, n?.value]
    }

    /**
     * delete node from the tree
     * @param node node to delete from the tree
    */
    private deleteNode(node: Node<K, V>): void {
        /**
         * moved up node
        */
        let un: Node<K, V> | null = null

        /**
         * replacement node
        */
        let rn: Node<K, V> | null = null

        if (!node.left)
            rn = node.right
        else if (!node.right)
            rn = node.left
        else {
            rn = this.minFrom(node.right)
            if (rn !== node.right) {
                un = rn
                this.transplant(rn, rn.right)
                rn.right = node.right
                rn.right.parent = rn
            }
            this.transplant(node, rn)
            rn.left = node.left
            rn.left.parent = rn
            rn.isRed = node.isRed
        }

        if (node === this.root)
            this.root = rn
        else {
            if (un)
                un.parent = node.parent
            else
                this.transplant(node, rn)
        }

        if (!node.isRed)
            this.fixDeletion(rn === null ? node : rn)
    }

    /**
     * @param on oldNode
     * @param n newNode
    */
    private transplant(on: Node<K, V>, n: Node<K, V> | null): void {
        if (!on.parent)
            this.root = n
        else if (on === on.parent.left)
            on.parent.left = n
        else
            on.parent.right = n

        if (n)
            n.parent = on.parent

    }

    /**
     * Fix the tree around node after node deletion
     * @param x node which deleted by deleteNode
    */
    private fixDeletion(x: Node<K, V> | null): void {
        while (x !== this.root && x && !x.isRed) {
            if (x === x.parent?.left) {
                /**
                 * sibling node
                */
                let sn = x.parent.right
                if (sn?.isRed) {
                    sn.isRed = false
                    x.parent.isRed = true
                    this.leftRotate(x.parent)
                    sn = x.parent.right
                }
                if (sn) {
                    if ((!sn.left || !sn.left.isRed) &&
                        (!sn.right || !sn.right.isRed)) {
                        sn.isRed = true
                        x = x.parent
                    } else {
                        if (!sn.right || !sn.right.isRed) {
                            sn.left!.isRed = false
                            sn.isRed = true
                            this.rightRotate(sn)
                            sn = x.parent.right!
                        }
                        sn.isRed = x.parent.isRed
                        x.parent.isRed = false
                        sn.right!.isRed = false
                        this.leftRotate(x.parent)
                        x = this.root
                    }
                } else
                    x = x.parent
            } else {
                /**
                 * sibling node
                */
                let sn = x.parent?.left
                if (sn?.isRed) {
                    sn.isRed = false
                    x.parent!.isRed = true
                    this.rightRotate(x.parent!)
                    sn = x.parent?.left
                }
                if (sn) {
                    if ((!sn.left || !sn.left.isRed) &&
                        (!sn.right || !sn.right.isRed)) {
                        sn.isRed = true
                        x = x.parent!
                    } else {
                        if (!sn.left || !sn.left.isRed) {
                            sn.right!.isRed = false
                            sn.isRed = true
                            this.leftRotate(sn)
                            sn = x.parent?.left!
                        }
                        sn.isRed = x.parent!.isRed
                        x.parent!.isRed = false
                        sn.left!.isRed = false
                        this.rightRotate(x.parent!)
                        x = this.root
                    }
                } else
                    x = x.parent!
            }
        }
        if (x) x.isRed = false
    }
}

export default SpeedIndex
