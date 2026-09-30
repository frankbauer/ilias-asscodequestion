class Player extends RemoteObject{
    private final int playerType;
    
    public Player(){
        this(0);
        System.out.println("Player added");
    }

    public Player(int type){
        super("Player");
        this.playerType = type;
        //System.out.println("Player " + type + " added");
        FloatingWorld.COMMAND_BUFFER.addNewObject(this);
    }

    protected void addAttributes(JsonObject json){
        json.put("playerType", this.playerType);
    }

    public void moveLeft(){
        this.move(-90);
    }

    public void moveRight(){
        this.move(90);
    }

    public void move(int value){            
        FloatingWorld.COMMAND_BUFFER.addCommand("movePlayer", this, value);       
    }
}
