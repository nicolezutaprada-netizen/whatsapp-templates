class Template{
    constructor(titulo, mensaje, hashtag){
        this.id = crypto.randomUUID(); 
        this.tituloreal=titulo;
        this.mensajereal=mensaje;
        this.hashtagreal=hashtag;
        this.fechareal=new Date();  //automaticamente guarda la fecha de un objeto

    }
}


