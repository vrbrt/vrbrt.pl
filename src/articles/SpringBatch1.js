
const article = {
    title: "Spring Batch - import CSV do bazy",
    data: Date.now(),
    id: '1',
    sections: [
        {
            title: 'Zadanie',
            id: '1',
            fragments: [
                {
                    type: 'paragraph',
                    content: `
Zacznijmy od prostego przypadku, wczytania listy produktów z pliku csv do bazy. Dane:
                    `.trim()
                },
                {
                    type: 'code',
                    language: 'csv',
                    content: `
nazwa,identyfikator producenta,cena,jednostka
lizak,6236-35235,1.00,szt
krówka,7334231-23562,19.00,kg
praliny,9165-362-124,15.00,kg
śliwka w czekoladzie,11265-612-521,32.00,kg
wafelek,72325-161-62,1.50,szt
                    `.trim()
                },
                {
                    type: 'paragraph',
                    content: `
Tabela w bazie danych do uzupełnienia:
                    `.trim()
                },
                {
                    type: 'code',
                    language: 'sql',
                    content:`
CREATE TABLE produkty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nazwa VARCHAR(255) NOT NULL,
    kod_producenta VARCHAR(50) NOT NULL,
    cena_jednostkowa DECIMAL(10,4) NOT NULL,
    jednostka VARCHAR(5) NOT NULL
);
                    `.trim()
                }
            ]
        },
        {
            title: 'Stworzenie projektu',
            id: '2',
            fragments: [
                {
                    type: 'paragraph',
                    content: `
Tworzymy projekt z kreatora na start.spring.io, będziemy potrzebować:
                    `.trim()
                },
                {
                    type: 'list',
                    content: [
                        'Spring Batch',
                        'Spring Data JPA',
                        'Lombok (opcjonalnie)',
                        'H2'
                    ]
                },
                {
                    type: 'code', language: 'groovy', content: `
plugins {
    id 'org.springframework.boot' version '2.6.0-SNAPSHOT'
    id 'io.spring.dependency-management' version '1.0.11.RELEASE'
    id 'java'
}

group = 'pl.vrbrt.spring'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '11'

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
    maven { url 'https://repo.spring.io/milestone' }
    maven { url 'https://repo.spring.io/snapshot' }
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-batch'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    compileOnly 'org.projectlombok:lombok'
    runtimeOnly 'com.h2database:h2'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.batch:spring-batch-test'
}

test {
    useJUnitPlatform()
}                    
                    `.trim()
                },
                {
                    type: 'link',
                    content: 'Wygenerowany projekt',
                    link: 'https://start.spring.io/#!type=gradle-project&language=java&platformVersion=2.6.0-SNAPSHOT&packaging=jar&jvmVersion=11&groupId=pl.vrbrt.spring&artifactId=springBatch&name=springBatch&description=Demo%20project%20for%20Spring%20Batch&packageName=pl.vrbrt.spring.springBatch&dependencies=batch,data-jpa,lombok,h2',
                },

            ]
        },
        {
            title: 'Połączenie z bazą, encja i repozytorium',
            id: '3',
            fragments: [
                {
                    type: 'paragraph',
                    content: `
Zapisanie czegokolwiek do bazy danych z wykorzystaniem Spring Data JPA wymaga stworzenia encji (POJO z anotacjami, które wysterują ORMa),
repozytorium, które umożliwi nam operacje na encjach, oraz, przede wszystkim działającego połączenia z bazą danych. Połaczenie z bazą danych
skonfigurujemy przez plik konfiguracyjny application.yml:
                    `.trim()
                },
                {
                    type: 'code', language: 'yml',
                    content: `
spring:
datasource:
    url: jdbc:h2:file:./data/springBatchDemo
    driverClassName: org.h2.Driver
    username: sa
    password: password
    initialization-mode: always
jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
    ddl-auto: none
batch:
    initialize-schema: always
                    `.trim()
                },
                {
                    type: 'paragraph', content: 'Klasa encji Product.java:'
                },
                {
                    type: 'code', language: 'java', content: `
@Entity
@Table(name = "PRODUKTY")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "nazwa")
    private String name;
    @Column(name = "kod_producenta")
    private String manufacturerCode;
    @Column(name = "cena_jednostkowa")
    private BigDecimal price;
    @Column(name = "jednostka")
    private String unit;
}
                    `.trim()
                },
                {
                    type: 'paragraph', content: 'Repozytorium ProductRepository.java:'
                },
                {
                    type: 'code', language: 'java', content: `
public interface ProductRepository extends CrudRepository<Product,Long> {}                    
                    `.trim()
                }
            ]
        },
        {
            title: 'Test przed zasileniem',
            id: 3,
            fragments: [
                {
                    type: 'paragraph',content: 'Zajrzyjmy do bazy przed jej zasileniem.'
                },
                {
                    type: 'code', language: 'java', content: `
@Slf4j
@SpringBootApplication
public class SpringBatchApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBatchApplication.class, args);
    }

    @Bean
    CommandLineRunner logDbContentsBefore(ProductRepository productRepository){
        return args -> {
            log.info("Products before batch");
            productRepository.findAll()
                    .forEach(p -> log.info("Product: {}",p));
        };
    }
}
                    `.trim()
                },
                {
                    type: 'paragraph', content: 'Tabela jest pusta, więc nie loguje się nam żaden element:'
                },
                {
                    type: 'code', language: 'log', content: `
2021-09-12 17:39:56.248  INFO 20660 --- [           main] j.LocalContainerEntityManagerFactoryBean : Initialized JPA EntityManagerFactory for persistence unit 'default'
2021-09-12 17:39:56.550  INFO 20660 --- [           main] p.v.s.s.SpringBatchApplication           : Started SpringBatchApplication in 2.842 seconds (JVM running for 3.279)
2021-09-12 17:39:56.552  INFO 20660 --- [           main] p.v.s.s.SpringBatchApplication           : Products before batch
2021-09-12 17:39:56.671  INFO 20660 --- [ionShutdownHook] j.LocalContainerEntityManagerFactoryBean : Closing JPA EntityManagerFactory for persistence unit 'default'
2021-09-12 17:39:56.675  INFO 20660 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2021-09-12 17:39:56.679  INFO 20660 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.                    
                    `.trim()
                }
            ]
        },
        {
            title: 'Batch',
            id: 4,
            fragments: [
                {
                    type: 'paragraph', content: `
Joby składają się z kroków. Kroki składają się z Readera, Writera i opcjonalnego ItemProcessora. Nasz importProductsJob będzie zawierał jeden, możliwie najprostszy krok.
Stworzymy zatem własną implementację ItemWritera, która, przy użyciu repozytorium zapisze listę otrzymaną listę produktów.
                    `.trim()
                },
                {
                    type: 'code', language: 'java', content: `
@Configuration
@EnableBatchProcessing
@RequiredArgsConstructor
@Slf4j
public class BatchConfig {

    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
    private final ProductRepository productRepository;


    @Bean
    public ItemWriter<Product> writer(){
        return productRepository::saveAll;
    }
}
                    `.trim()
                },
                {
                    type: 'paragraph', content: 'Konieczny będzie też ItemReader, który odczyta plik csv z folderu resources w naszym projekcie. Warto zwrócić uwagę na metodę linesToSkip(), która pozwala pominąć pewną liczbę pierwszy (np nagłówków kolumn), oraz BeanWrapperFieldSetMapper, który z wartości w pojedynczym wierszu stworzy obiekt:'
                },
                {
                    type: 'code', language: 'java', content: `
@Bean
public FlatFileItemReader<Product> reader() {
    return new FlatFileItemReaderBuilder<Product>()
            .name("personItemReader")
            .resource(new ClassPathResource("products.csv"))
            .linesToSkip(1)
            .delimited()
            .names("name", "manufacturerCode", "price", "unit")
            .fieldSetMapper(new BeanWrapperFieldSetMapper<Product>() {{
                setTargetType(Product.class);
            }})
            .build();
}
                    `.trim()
                },
                {
                    type: 'paragraph', content: 'W końcu możemy stworzyć pojedynczy krok, w którego skład wejdą utworzone instancje ItemReadera i ItemWritera:'
                },
                {
                    type: 'code', language: 'java', content: `
@Bean
public Step step1(FlatFileItemReader<Product> reader, ItemWriter<Product> writer) {
    return stepBuilderFactory.get("step1")
            .<Product,Product>chunk(2)
            .reader(reader)
            .writer(writer)
            .build();
}
                    `.trim()
                },
                {
                    type: 'paragraph', content: 'Zanim stworzymy job, który zostanie uruchomiony automatycznie, razem z aplikacją, zapewnimy sobie jeszcze możliwość obejrzenia stanu bazy przed i po wykonaniu Joba. Wcześniej wykorzystana implementacja wykonywałaby się już po realizacji Joba.'
                },
                {
                    type: 'code', language: 'java', content: `
@Bean
public JobExecutionListener executionListener(){
    return new JobExecutionListener() {
        @Override
        public void beforeJob(JobExecution jobExecution) {
            log.info("Products before batch");
            productRepository.findAll()
                    .forEach(p -> log.info("Product: {}",p));
        }

        @Override
        public void afterJob(JobExecution jobExecution) {
            log.info("Products after batch");
            productRepository.findAll()
                    .forEach(p -> log.info("Product: {}",p));
        }
    };
}
                    `.trim()
                },
                {
                    type: 'paragraph', content: 'W końcu, zapewniwszy sobie możliwość weryfikacji działania Joba, możemy go stworzyć'
                },
                {
                    type: 'code', language: 'java', content: `
@Bean
public Job importProductsJob(Step step1, JobExecutionListener listener){
    return jobBuilderFactory.get("importProductJob")
            .listener(listener)
            .incrementer(new RunIdIncrementer())
            .flow(step1)
            .end()
            .build();
}
                    `.trim()
                },
                {
                    type: 'paragraph', content: 'i uruchomić całą aplikację, żeby zweryfikować jego działanie:'
                },
                {
                    type: 'code', language: 'log', content: `
2021-09-12 18:23:22.880  INFO 22268 --- [           main] pl.vrbrt.spring.springBatch.BatchConfig  : Products before batch
2021-09-12 18:23:22.993  INFO 22268 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [step1]
2021-09-12 18:23:23.058  INFO 22268 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [step1] executed in 65ms
2021-09-12 18:23:23.061  INFO 22268 --- [           main] pl.vrbrt.spring.springBatch.BatchConfig  : Products after batch
2021-09-12 18:23:23.068  INFO 22268 --- [           main] pl.vrbrt.spring.springBatch.BatchConfig  : Product: Product(id=1, name=lizak, manufacturerCode=6236-35235, price=1.0000, unit=szt)
2021-09-12 18:23:23.077  INFO 22268 --- [           main] pl.vrbrt.spring.springBatch.BatchConfig  : Product: Product(id=2, name=krówka, manufacturerCode=7334231-23562, price=19.0000, unit=kg)
2021-09-12 18:23:23.077  INFO 22268 --- [           main] pl.vrbrt.spring.springBatch.BatchConfig  : Product: Product(id=3, name=praliny, manufacturerCode=9165-362-124, price=15.0000, unit=kg)
2021-09-12 18:23:23.077  INFO 22268 --- [           main] pl.vrbrt.spring.springBatch.BatchConfig  : Product: Product(id=4, name=śliwka w czekoladzie, manufacturerCode=11265-612-521, price=32.0000, unit=kg)
2021-09-12 18:23:23.077  INFO 22268 --- [           main] pl.vrbrt.spring.springBatch.BatchConfig  : Product: Product(id=5, name=wafelek, manufacturerCode=72325-161-62, price=1.5000, unit=szt)
2021-09-12 18:23:23.079  INFO 22268 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [FlowJob: [name=importProductJob]] completed with the following parameters: [{run.id=6}] and the following status: [COMPLETED] in 186ms
2021-09-12 18:23:23.086  INFO 22268 --- [ionShutdownHook] j.LocalContainerEntityManagerFactoryBean : Closing JPA EntityManagerFactory for persistence unit 'default'
2021-09-12 18:23:23.089  INFO 22268 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2021-09-12 18:23:23.094  INFO 22268 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
                    `.trim()
                },
                {
                    type: 'paragraph', content: 'W ten sposób stworzyliśmy prostego batcha, który wczytuje dane z pliku csv, pomijając wiersza nagłówka i zapisuje je do bazy danych.'
                }
            ]
        }
    ]
}

export default article;