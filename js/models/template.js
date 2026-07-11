class Template{
    constructor(titulo, mensaje, hashtag){
        this.id = crypto.randomUUID(); //genera un codigo distinto, cada plantilla debe tener un identificador
        this.tituloreal=titulo;  //tituloreal es lo q se usa en toda la app
        this.mensajereal=mensaje;
        this.hashtagreal=hashtag;
        this.fechareal=new Date();  //automaticamente guarda la fecha de un objeto

    }
}


