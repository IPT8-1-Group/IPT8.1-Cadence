use stundenplaner;

create table ModuleLearningObjective(
    id int auto_increment primary key,
    objective text not null,
    position int unsigned not null,
    fk_module int not null,

    unique (fk_module, position),


    constraint fk_learning_objective_module
        foreign key(fk_module) references Module(id)
            on delete cascade
);
