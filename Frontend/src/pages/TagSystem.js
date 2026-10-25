class Tag {
    static Id = 0;
    constructor(nombre) {  
        Tag.Id++;
        this.Id = Tag.Id;
        this.nombre = nombre;
    }
}

export const tagsDefault = [
    new Tag("Llegue tarde a un parcial"),
    new Tag("Llegue tarde a un final"),
    new Tag("Llegue tarde a un quiz"),
    new Tag("Llegue tarde a clase"),
    new Tag("Entregue un proyecto tarde"),
    new Tag("No hice un proyecto"),
    new Tag("No hice a tiempo mi parte de un trabajo"),
    new Tag("Llegue tarde al trabajo"),
    new Tag("No fui a una reunion")
];

export function createTag(tags, tag) {
    const existe = tags.some((tagExistente) => tagExistente.nombre.toLowerCase() === tag.trim().toLowerCase());

    if (tag && tag.trim() !== "" && !existe) {
        const nuevoTag = new Tag(tag.trim());
        return [...tags, nuevoTag];
    } else {
        return tags;
    }
}