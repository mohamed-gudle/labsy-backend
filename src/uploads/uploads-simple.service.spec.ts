import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UploadsService } from './uploads.service';

describe('UploadsService', () => {
  let service: UploadsService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-bucket'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have uploadProfilePicture method', () => {
    expect(typeof service.uploadProfilePicture).toBe('function');
  });

  it('should have deleteFile method', () => {
    expect(typeof service.deleteFile).toBe('function');
  });

  it('should have deleteProfilePicture method', () => {
    expect(typeof service.deleteProfilePicture).toBe('function');
  });
});
