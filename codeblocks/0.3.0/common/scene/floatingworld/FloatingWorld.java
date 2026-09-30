class FloatingWorld {
    private static final java.util.List<Player>players = new java.util.LinkedList<>();
    public static final CommandBuffer COMMAND_BUFFER = new CommandBuffer();
    private static int NEXT_PLAYER_TYPE = 0;    
    public static void show(){
        FloatingWorld.COMMAND_BUFFER.addEmptyCommand("show");
    }

    public static Player addPlayer(){
        Player p = new Player(NEXT_PLAYER_TYPE++);
        players.add(p);
        FloatingWorld.COMMAND_BUFFER.addCommand("addPlayer", p);
        return p;
    }

    public static void removePlayer(int idx){
        if (idx<players.size() && idx>=0){
            FloatingWorld.COMMAND_BUFFER.addCommand("removePlayer", players.get(idx));
            players.remove(idx);
        } else {
            System.err.println("Unknown Player Index: "+idx);
        }
    }
    
    public static void moveLeft(){
        move(-90);
    }

    public static void moveRight(){
        move(90);
    }

    public static void movePlayerLeft(int idx){
        movePlayer(idx, -90);
    }

    public static void movePlayerRight(int idx){
        movePlayer(idx, 90);
    }

    public static void move(int value){
        FloatingWorld.COMMAND_BUFFER.addCommand("moveIsland", value);
    }

    public static void movePlayer(int idx, int value){
        if (idx<players.size() && idx>=0){
            FloatingWorld.COMMAND_BUFFER.addCommand("movePlayer", players.get(idx), value);
        } else {
            System.err.println("Unknown Player Index: "+idx);
        }
    }
}